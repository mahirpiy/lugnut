import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { jobs, odometerEntries, records } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const params = await props.params;
    const { vehicleId } = params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const record = await db
      .select({
        id: records.id,
        title: records.title,
        jobId: records.jobId,
        jobTitle: jobs.title,
        date: jobs.date,
        odometer: odometerEntries.odometer,
      })
      .from(records)
      .innerJoin(jobs, eq(records.jobId, jobs.id))
      .innerJoin(odometerEntries, eq(jobs.odometerId, odometerEntries.id))
      .where(eq(jobs.vehicleId, vehicleId))
      .then((results) => results[0]);

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Get record error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
