import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { jobs, odometerEntries, records } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ vehicleId: string }> }
) {
  const params = await props.params;
  try {
    const { vehicleId } = params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unlinkedRecords = await db
      .select({
        id: records.id,
        title: records.title,
        jobId: records.jobId,
        jobName: jobs.title,
        date: jobs.date,
        odometer: odometerEntries.odometer,
      })
      .from(records)
      .innerJoin(jobs, eq(records.jobId, jobs.id))
      .innerJoin(odometerEntries, eq(jobs.odometerId, odometerEntries.id))
      .where(
        and(eq(jobs.vehicleId, vehicleId), isNull(records.serviceIntervalId))
      );

    return NextResponse.json(unlinkedRecords);
  } catch (error) {
    console.error("Get unlinked records error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
