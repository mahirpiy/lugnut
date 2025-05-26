import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { fuelEntries, vehicles } from "@/lib/db/schema";
import { updateOdometer } from "@/utils/odometer";
import { and, desc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const fuelEntrySchema = z.object({
  date: z.date(),
  odometer: z
    .number()
    .int()
    .min(0, "Odometer must be positive")
    .max(10000000, "Odometer seems too high"),
  gallons: z
    .number()
    .min(0.1, "Gallons must be at least 0.1")
    .max(1000, "Gallons seems too high"),
  totalCost: z.number().min(0, "Total cost cannot be negative").optional(),
  gasStation: z
    .string()
    .max(100, "Gas station name must be less than 100 characters")
    .optional(),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

interface RouteParams {
  params: {
    vehicleUuid: string;
  };
}

// GET all fuel entries for a vehicle
export async function GET(request: Request, { params }: RouteParams) {
  const { vehicleUuid } = await params;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has paid access
    if (!session.user.isPaid) {
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
        and(
          eq(vehicles.uuid, vehicleUuid),
          eq(vehicles.userId, session.user.id)
        )
      )
      .limit(1);

    if (!vehicle.length) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Get all fuel entries for this vehicle
    const entries = await db
      .select()
      .from(fuelEntries)
      .where(eq(fuelEntries.vehicleId, vehicle[0].id))
      .orderBy(desc(fuelEntries.date), desc(fuelEntries.odometer));

    // Calculate MPG for each entry (except the first one)
    const enrichedEntries = entries.map((entry, index) => {
      let mpg = null;
      let costPerGallon = null;

      // Calculate cost per gallon
      if (entry.totalCost && parseFloat(entry.totalCost) > 0) {
        costPerGallon = parseFloat(entry.totalCost) / parseFloat(entry.gallons);
      }

      // Calculate MPG (need previous entry for miles driven)
      if (index < entries.length - 1) {
        const previousEntry = entries[index + 1];
        const milesDriven = entry.odometer - previousEntry.odometer;
        if (milesDriven > 0) {
          mpg = milesDriven / parseFloat(entry.gallons);
        }
      }

      return {
        ...entry,
        mpg: mpg ? Math.round(mpg * 10) / 10 : null, // Round to 1 decimal
        costPerGallon: costPerGallon
          ? Math.round(costPerGallon * 100) / 100
          : null, // Round to 2 decimals
      };
    });

    return NextResponse.json(enrichedEntries);
  } catch (error) {
    console.error("Get fuel entries error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new fuel entry
export async function POST(request: Request, { params }: RouteParams) {
  const { vehicleUuid } = await params;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has paid access
    if (!session.user.isPaid) {
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
        and(
          eq(vehicles.uuid, vehicleUuid),
          eq(vehicles.userId, session.user.id)
        )
      )
      .limit(1);

    if (!vehicle.length) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = fuelEntrySchema.parse({
      ...body,
      date: new Date(body.date),
    });

    // Validate odometer is greater than vehicle's initial odometer
    const vehicleData = vehicle[0];
    if (validatedData.odometer < vehicleData.initialOdometer) {
      return NextResponse.json(
        {
          error: `Odometer must be at least ${vehicleData.initialOdometer} miles (vehicle's initial odometer)`,
        },
        { status: 400 }
      );
    }

    // Create fuel entry
    const [newEntry] = await db
      .insert(fuelEntries)
      .values({
        vehicleId: vehicle[0].id,
        date: validatedData.date,
        odometer: validatedData.odometer,
        gallons: validatedData.gallons.toString(),
        totalCost: validatedData.totalCost?.toString(),
        gasStation: validatedData.gasStation,
        notes: validatedData.notes,
      })
      .returning();

    // Update vehicle's current odometer if this entry is higher
    if (validatedData.odometer > vehicleData.currentOdometer) {
      await updateOdometer(vehicleUuid, validatedData.odometer);
    }

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("Create fuel entry error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
