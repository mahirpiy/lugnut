import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { vehicles } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    vehicleUuid: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    params = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicle = await db
      .select()
      .from(vehicles)
      .where(
        and(
          eq(vehicles.uuid, params.vehicleUuid),
          eq(vehicles.userId, session.user.id)
        )
      )
      .limit(1);

    if (!vehicle.length) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(vehicle[0]);
  } catch (error) {
    console.error("Get vehicle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
