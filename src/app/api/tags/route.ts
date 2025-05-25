// src/app/api/tags/route.ts
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get preset tags and user's custom tags
    const userTags = await db.select().from(tags).orderBy(tags.name);

    return NextResponse.json(userTags);
  } catch (error) {
    console.error("Get tags error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
