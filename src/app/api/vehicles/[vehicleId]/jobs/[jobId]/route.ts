// src/app/api/vehicles/[vehicleId]/jobs/[jobId]/route.ts
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  jobs,
  parts,
  records,
  recordTags,
  tags,
  vehicles,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    vehicleId: string;
    jobId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify vehicle ownership and get job
    const jobData = await db
      .select()
      .from(jobs)
      .innerJoin(vehicles, eq(jobs.vehicleId, vehicles.id))
      .where(
        and(
          eq(jobs.id, params.jobId),
          eq(jobs.vehicleId, params.vehicleId),
          eq(vehicles.userId, session.user.id)
        )
      )
      .limit(1);

    if (!jobData.length) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobData[0].jobs;

    // Get all records for this job
    const jobRecords = await db
      .select()
      .from(records)
      .where(eq(records.jobId, params.jobId));

    // Get parts and tags for each record
    const enrichedRecords = await Promise.all(
      jobRecords.map(async (record) => {
        // Get parts for this record
        const recordParts = await db
          .select()
          .from(parts)
          .where(eq(parts.recordId, record.id));

        // Get tags for this record
        const recordTagsData = await db
          .select({
            tagId: tags.id,
            tagName: tags.name,
            tagIsPreset: tags.isPreset,
          })
          .from(recordTags)
          .innerJoin(tags, eq(recordTags.tagId, tags.id))
          .where(eq(recordTags.recordId, record.id));

        // Calculate total cost for this record
        const totalCost = recordParts.reduce((sum, part) => {
          return sum + parseFloat(part.cost || "0") * part.quantity;
        }, 0);

        return {
          id: record.id,
          title: record.title,
          notes: record.notes,
          parts: recordParts.map((part) => ({
            id: part.id,
            name: part.name,
            partNumber: part.partNumber,
            manufacturer: part.manufacturer,
            cost: part.cost,
            quantity: part.quantity,
          })),
          tags: recordTagsData.map((tag) => ({
            id: tag.tagId,
            name: tag.tagName,
            isPreset: tag.tagIsPreset,
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
    const laborCost = parseFloat(job.laborCost || "0");
    const totalCost = totalPartsCost + laborCost;

    const response = {
      id: job.id,
      title: job.title,
      date: job.date,
      odometer: job.odometer,
      laborCost: job.laborCost,
      shopName: job.shopName,
      notes: job.notes,
      records: enrichedRecords,
      totalPartsCost,
      totalCost,
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
