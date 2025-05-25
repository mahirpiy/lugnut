import { authOptions } from "@/lib/auth";
import { deleteUploadthingFiles } from "@/lib/uploadthing";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileKeys } = await request.json();
    await deleteUploadthingFiles(fileKeys);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete files:", error);
    return NextResponse.json(
      { error: "Failed to delete files" },
      { status: 500 }
    );
  }
}
