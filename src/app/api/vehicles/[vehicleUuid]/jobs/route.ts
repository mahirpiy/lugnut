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
  vehicles,
} from "@/lib/db/schema";
import { jobSchema } from "@/lib/validations/job";
import { updateOdometer } from "@/utils/odometer";
import { and, count, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    vehicleUuid: string;
  };
}

// GET all jobs for a vehicle
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { vehicleUuid } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify vehicle ownership
    const vehicle = await db
      .select()
      .from(vehicles)
      .where(
        and(
          eq(vehicles.uuid, vehicleUuid),
          eq(vehicles.userId, session.user.id)
        )
      )
      .limit(1);

    if (!vehicle.length) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Get all jobs for this vehicle
    const vehicleJobs = await db
      .select({
        // Job fields
        id: jobs.id,
        uuid: jobs.uuid,
        title: jobs.title,
        date: jobs.date,
        laborCost: jobs.laborCost,
        isDiy: jobs.isDiy,
        shopName: jobs.shopName,
        notes: jobs.notes,
        hours: jobs.hours,
        // Odometer fields
        odometer: odometerEntries.odometer,
        odometerDate: odometerEntries.entryDate,
        odometerNotes: odometerEntries.notes,
      })
      .from(jobs)
      .innerJoin(odometerEntries, eq(jobs.odometerId, odometerEntries.id))
      .where(eq(jobs.vehicleId, vehicle[0].id))
      .orderBy(jobs.date);

    // Get parts count and cost for each job
    const enrichedJobs = await Promise.all(
      vehicleJobs.map(async (job) => {
        // Get all records for this job
        const jobRecords = await db
          .select({ id: records.id })
          .from(records)
          .where(eq(records.jobId, job.id));

        let totalPartsCount = 0;
        let totalPartsCost = 0;

        for (const record of jobRecords) {
          const recordParts = await db
            .select()
            .from(parts)
            .where(eq(parts.recordId, record.id));

          totalPartsCount += recordParts.length;
          totalPartsCost += recordParts.reduce((sum, part) => {
            return sum + parseFloat(part.cost || "0.00");
          }, 0);
        }

        return {
          id: job.id,
          title: job.title,
          date: job.date,
          odometer: job.odometer,
          laborCost: job.laborCost,
          isDiy: job.isDiy,
          shopName: job.shopName,
          notes: job.notes,
          totalPartsCount,
          totalPartsCost: totalPartsCost.toFixed(2),
          uuid: job.uuid,
          hours: job.hours ? parseFloat(job.hours) : 0,
        };
      })
    );

    return NextResponse.json(enrichedJobs);
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new job
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { vehicleUuid } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify vehicle ownership
    const vehicle = await db
      .select()
      .from(vehicles)
      .where(
        and(
          eq(vehicles.uuid, vehicleUuid),
          eq(vehicles.userId, session.user.id)
        )
      )
      .limit(1);

    if (!vehicle.length) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Check job limit for free users
    if (!session.user.isPaid) {
      const jobCount = await db
        .select({ count: count() })
        .from(jobs)
        .where(eq(jobs.vehicleId, vehicle[0].id));

      if (jobCount[0].count >= 2) {
        return NextResponse.json(
          {
            error:
              "Free users are limited to 2 jobs per vehicle. Upgrade to add more.",
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const validatedData = jobSchema.parse({
      ...body,
      date: body.date ? new Date(body.date) : new Date(),
    });

    // Validate odometer is greater than vehicle's initial odometer (allow backdating)
    const vehicleData = vehicle[0];
    if (validatedData.odometer < vehicleData.initialOdometer) {
      return NextResponse.json(
        {
          error: `Odometer must be at least ${vehicleData.initialOdometer} miles (vehicle's initial odometer)`,
        },
        { status: 400 }
      );
    }

    try {
      const [newJob] = await db.transaction(async (tx) => {
        // first create the odometer entry
        const odometerId = await updateOdometer(
          vehicle[0].id,
          vehicle[0].currentOdometer,
          validatedData.odometer,
          "job",
          validatedData.date
        );

        if (odometerId instanceof Error) {
          throw new Error("Failed to create odometer entry");
        }

        // Create job first
        const [newJob] = await tx
          .insert(jobs)
          .values({
            vehicleId: vehicle[0].id,
            title: validatedData.title,
            date: validatedData.date,
            odometerId: odometerId,
            laborCost: validatedData.laborCost?.toString() || "0.00",
            isDiy: validatedData.isDiy, // New field
            shopName: validatedData.shopName,
            notes: validatedData.notes,
            url: validatedData.url,
            difficulty: validatedData.difficulty,
            hours: validatedData.hours?.toString() || "0.00",
          })
          .returning();

        if (validatedData.jobPhotos && validatedData.jobPhotos.length > 0) {
          await tx.insert(jobPhotos).values(
            validatedData.jobPhotos.map((url) => ({
              jobId: newJob.id,
              url,
            }))
          );
        }

        // Create records and parts
        for (const recordData of validatedData.records) {
          const [newRecord] = await tx
            .insert(records)
            .values({
              jobId: newJob.id,
              title: recordData.title,
              notes: recordData.notes,
            })
            .returning();

          // Create parts for this record
          for (const partData of recordData.parts) {
            const [newPart] = await tx
              .insert(parts)
              .values({
                recordId: newRecord.id,
                name: partData.name,
                partNumber: partData.partNumber,
                manufacturer: partData.manufacturer,
                cost: partData.cost?.toString() || "0.00",
                quantity: partData.quantity,
                url: partData.url,
              })
              .returning();

            if (partData.partPhotos && partData.partPhotos.length > 0) {
              await tx.insert(partPhotos).values(
                partData.partPhotos.map((url) => ({
                  partId: newPart.id,
                  url,
                }))
              );
            }
          }

          // Create record-tag relationships
          for (const tagId of recordData.tagIds) {
            await tx.insert(recordTags).values({
              recordId: newRecord.id,
              tagId: tagId,
            });
          }
        }

        return [newJob];
      });

      return NextResponse.json(newJob, { status: 201 });
    } catch (insertError) {
      console.error("Error creating job:", insertError);
      return NextResponse.json(
        { error: "Failed to create job" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
