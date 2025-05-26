import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { odometerEntries, vehicles } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface RouteParams {
  params: {
    vehicleUuid: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { vehicleUuid } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const entries = await db
      .select({ odometerEntries })
      .from(odometerEntries)
      .innerJoin(vehicles, eq(odometerEntries.vehicleId, vehicles.id))
      .where(
        and(
          eq(vehicles.uuid, vehicleUuid),
          eq(vehicles.userId, session.user.id)
        )
      );

    const toReturn = entries.map((entry) => entry.odometerEntries);

    return NextResponse.json(toReturn);
  } catch (error) {
    console.error("[ODOMETER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
