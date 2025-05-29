import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  serviceIntervals,
  serviceIntervalTags,
  vehicles,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: Request,
  props: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const params = await props.params;
    const { vehicleId } = params;

    const intervals = await db
      .select()
      .from(serviceIntervals)
      .where(eq(serviceIntervals.vehicleId, vehicleId));

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
