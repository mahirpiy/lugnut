import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  jobs,
  odometerEntries,
  records,
  serviceIntervals,
  serviceIntervalTags,
  tags,
  vehicles,
} from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: Request,
  props: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const params = await props.params;
    const { vehicleId } = params;

    const [baseIntervals, intervalRecords] = await Promise.all([
      // Query 1: Get intervals with their tags
      db
        .select({
          id: serviceIntervals.id,
          name: serviceIntervals.name,
          mileageInterval: serviceIntervals.mileageInterval,
          monthInterval: serviceIntervals.monthInterval,
          notes: serviceIntervals.notes,
          tags: sql<
            string[]
          >`array_remove(array_agg(DISTINCT ${tags.name}), null)`.as("tags"),
        })
        .from(serviceIntervals)
        .leftJoin(
          serviceIntervalTags,
          eq(serviceIntervals.id, serviceIntervalTags.serviceIntervalId)
        )
        .leftJoin(tags, eq(serviceIntervalTags.tagId, tags.id))
        .where(eq(serviceIntervals.vehicleId, vehicleId))
        .groupBy(serviceIntervals.id),

      // Query 2: Get all records with their job dates and odometer readings
      db
        .select({
          serviceIntervalId: records.serviceIntervalId,
          id: records.id,
          title: records.title,
          odometer: odometerEntries.odometer,
          date: jobs.date ?? odometerEntries.entryDate,
          jobId: jobs.id,
        })
        .from(records)
        .leftJoin(jobs, eq(records.jobId, jobs.id))
        .leftJoin(odometerEntries, eq(jobs.odometerId, odometerEntries.id))
        .where(eq(jobs.vehicleId, vehicleId)),
    ]);

    // Combine the results
    const intervals = baseIntervals.map((interval) => {
      return {
        ...interval,
        lastServiced: intervalRecords
          .filter((record) => record.serviceIntervalId === interval.id)
          .sort((a, b) => b.date!.getTime() - a.date!.getTime())[0],
      };
    });

    return NextResponse.json(intervals);
  } catch (error) {
    console.error("Get service intervals error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ vehicleId: string }> }
) {
  const params = await props.params;
  const { vehicleId } = params;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has paid access
    if (!session.user.hasActiveSubscription) {
      return NextResponse.json(
        { error: "Fuel tracking requires a paid subscription" },
        { status: 403 }
      );
    }

    const vehicle = await db
      .select()
      .from(vehicles)
      .where(
        and(eq(vehicles.id, vehicleId), eq(vehicles.userId, session.user.id))
      )
      .limit(1);

    if (!vehicle.length) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const body = await request.json();

    const { name, mileageInterval, timeInterval, tagIds, notes } = body;

    await db.transaction(async (tx) => {
      const [interval] = await tx
        .insert(serviceIntervals)
        .values({
          name,
          vehicleId,
          mileageInterval,
          monthInterval: timeInterval, // the client sends timeInterval, but we store monthInterval
          notes,
        })
        .returning();

      if (tagIds && tagIds.length) {
        await tx.insert(serviceIntervalTags).values(
          tagIds.map((tagId: string) => ({
            serviceIntervalId: interval.id,
            tagId,
          }))
        );
      }

      return interval;
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Post service interval error:", error);
  }
}
