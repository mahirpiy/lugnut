import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { vehicles } from "@/lib/db/schema";
import { vehicleSchema } from "@/lib/validations/vehicle";
import { count, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userVehicles = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.userId, session.user.id))
      .orderBy(vehicles.createdAt);

    return NextResponse.json(userVehicles);
  } catch (error) {
    console.error("Get vehicles error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check vehicle limit for free users
    if (!session.user.isPaid) {
      const vehicleCount = await db
        .select({ count: count() })
        .from(vehicles)
        .where(eq(vehicles.userId, session.user.id));

      if (vehicleCount[0].count >= 1) {
        return NextResponse.json(
          {
            error: "Free users are limited to 1 vehicle. Upgrade to add more.",
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();

    // Transform the purchaseDate string to a Date object before validation
    const transformedBody = {
      ...body,
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
    };

    const validatedData = vehicleSchema.parse(transformedBody);

    const newVehicle = await db
      .insert(vehicles)
      .values({
        userId: session.user.id,
        ...validatedData,
      })
      .returning();

    return NextResponse.json(newVehicle[0], { status: 201 });
  } catch (error) {
    console.error("Create vehicle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
