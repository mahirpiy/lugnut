import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  jobPhotos,
  jobs,
  odometerEntries,
  partPhotos,
  parts,
  records,
  recordTags,
  tags,
  vehicles,
} from "@/lib/db/schema";
import { getSignedUrl } from "@/lib/supabase/url-signer";
import { and, eq, inArray } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ vehicleId: string; jobId: string }> }
) {
  const params = await props.params;
  try {
    const { vehicleId, jobId } = params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify vehicle ownership and get job
    const jobData = await db
      .select({
        job: jobs,
        odometer: odometerEntries.odometer,
      })
      .from(jobs)
      .innerJoin(odometerEntries, eq(jobs.odometerId, odometerEntries.id))
      .innerJoin(vehicles, eq(jobs.vehicleId, vehicles.id))
      .where(
        and(
          eq(jobs.id, jobId),
          eq(jobs.vehicleId, vehicles.id),
          eq(vehicles.id, vehicleId),
          eq(vehicles.userId, session.user.id)
        )
      )
      .limit(1);

    if (!jobData.length) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobData[0].job;
    const odometer = jobData[0].odometer;

    // Then get all photos for this job
    const photos = await db
      .select()
      .from(jobPhotos)
      .where(eq(jobPhotos.jobId, job.id));

    const jobPhotoUrls = await getPhotoUrls(
      photos
        .map((photo) => photo.filePath)
        .filter((filePath) => filePath !== null)
    );

    // Get all records for this job
    const jobRecords = await db
      .select()
      .from(records)
      .innerJoin(jobs, eq(records.jobId, jobs.id))
      .where(eq(jobs.id, jobId));

    // Get parts and tags for each record
    const enrichedRecords = await Promise.all(
      jobRecords.map(async (record) => {
        // Get parts for this record
        const recordParts = await db
          .select()
          .from(parts)
          .where(eq(parts.recordId, record.records.id));

        const partIds = recordParts.map((part) => part.id);

        // Get tags for this record
        const recordTagsData = await db
          .select({
            tagId: tags.id,
            tagName: tags.name,
          })
          .from(recordTags)
          .innerJoin(tags, eq(recordTags.tagId, tags.id))
          .where(eq(recordTags.recordId, record.records.id));

        // Calculate total cost for this record
        const totalCost = recordParts.reduce((sum, part) => {
          return sum + parseFloat(part.cost || "0.00");
        }, 0);

        const partPhotosData = await db
          .select()
          .from(partPhotos)
          .where(inArray(partPhotos.partId, partIds));

        // Create a map of partId -> photo details for photos with filePath
        const partPhotoMap = new Map<string, { id: string; url: string }[]>();

        await Promise.all(
          partPhotosData
            .filter(
              (photo): photo is typeof photo & { url: string } =>
                photo.filePath !== null
            )
            .map(async (photo) => {
              const signedUrl = await getSignedUrl(photo.filePath!);

              if (partPhotoMap.has(photo.partId)) {
                partPhotoMap.get(photo.partId)?.push({
                  id: photo.id,
                  url: signedUrl,
                });
              } else {
                partPhotoMap.set(photo.partId, [
                  { id: photo.id, url: signedUrl },
                ]);
              }
            })
        );

        // Convert map to a regular object for JSON serialization
        const partPhotosWithUrls = Object.fromEntries(partPhotoMap);

        return {
          id: record.records.id,
          title: record.records.title,
          notes: record.records.notes,
          parts: recordParts.map((part) => ({
            id: part.id,
            name: part.name,
            partNumber: part.partNumber,
            manufacturer: part.manufacturer,
            cost: part.cost,
            quantity: part.quantity,
            partPhotos: partPhotosWithUrls[part.id] || [],
          })),
          tags: recordTagsData.map((tag) => ({
            id: tag.tagId,
            name: tag.tagName,
          })),
          totalCost,
        };
      })
    );

    // Calculate totals
    const totalPartsCost = enrichedRecords.reduce(
      (sum, record) => sum + record.totalCost,
      0
    );
    const laborCost = parseFloat(job.laborCost || "0.00");
    const totalCost = totalPartsCost + laborCost;

    const response = {
      id: job.id,
      title: job.title,
      date: job.date,
      odometer: odometer,
      laborCost: job.laborCost,
      isDiy: job.isDiy, // Include isDiy field
      shopName: job.shopName,
      notes: job.notes,
      records: enrichedRecords,
      totalPartsCost,
      totalCost,
      hours: job.hours,
      difficulty: job.difficulty,
      photos: jobPhotoUrls,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getPhotoUrls(keys: string[]) {
  const urls = await Promise.all(
    keys.map(async (key) => await getSignedUrl(key))
  );
  return urls;
}
