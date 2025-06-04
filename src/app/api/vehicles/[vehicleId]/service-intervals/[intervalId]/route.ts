import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { serviceIntervals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ intervalId: string }> }
) {
  try {
    const params = await props.params;
    const { intervalId } = params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interval = await db
      .select()
      .from(serviceIntervals)
      .where(eq(serviceIntervals.id, intervalId))
      .then((results) => results[0]);

    if (!interval) {
      return NextResponse.json(
        { error: "Service interval not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(interval);
  } catch (error) {
    console.error("Get service interval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
