import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { odometerEntries, vehicles } from "@/lib/db/schema";
import { updateOdometer } from "@/utils/odometer";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const odometerEntrySchema = z.object({
  date: z.date(),
  odometer: z
    .number()
    .int()
    .min(0, "Odometer must be positive")
    .max(10000000, "Odometer seems too high"),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

interface RouteParams {
  params: {
    vehicleId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { vehicleId } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const entries = await db
      .select({ odometerEntries })
      .from(odometerEntries)
      .innerJoin(vehicles, eq(odometerEntries.vehicleId, vehicles.id))
      .where(
        and(eq(vehicles.id, vehicleId), eq(vehicles.userId, session.user.id))
      );

    const toReturn = entries.map((entry) => entry.odometerEntries);

    return NextResponse.json(toReturn);
  } catch (error) {
    console.error("[ODOMETER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { vehicleId } = await params;

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

    // Verify vehicle ownership
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
    const validatedData = odometerEntrySchema.parse({
      ...body,
      date: new Date(body.date),
    });

    const odometerId = await updateOdometer(
      vehicle[0].id,
      vehicle[0].currentOdometer,
      validatedData.odometer,
      "reading",
      validatedData.date
    );

    if (odometerId instanceof Error) {
      return NextResponse.json(
        { error: "Failed to update odometer" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[ODOMETER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
