import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { records, serviceIntervals, vehicles } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  props: { params: Promise<{ vehicleId: string; intervalId: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the interval exists for the user and vehicle
    const interval = await db
      .select({
        id: serviceIntervals.id,
      })
      .from(serviceIntervals)
      .innerJoin(vehicles, eq(serviceIntervals.vehicleId, vehicles.id))
      .where(
        sql`${serviceIntervals.id} = ${params.intervalId} AND ${vehicles.userId} = ${session.user.id}`
      );

    if (!interval.length) {
      return NextResponse.json(
        { error: "Service interval not found" },
        { status: 404 }
      );
    }
    const { recordIds } = await req.json();

    if (!Array.isArray(recordIds) || recordIds.length === 0) {
      return NextResponse.json(
        { error: "Record IDs array is required" },
        { status: 400 }
      );
    }

    // Update all records in a single query
    await db
      .update(records)
      .set({ serviceIntervalId: params.intervalId })
      .where(sql`${records.id} IN ${recordIds}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error linking records:", error);
    return NextResponse.json(
      { error: "Failed to link records" },
      { status: 500 }
    );
  }
}
