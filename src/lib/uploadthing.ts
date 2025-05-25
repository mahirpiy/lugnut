// In src/lib/uploadthing-utils.ts
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function deleteUploadthingFiles(fileKeys: string[]) {
  try {
    await utapi.deleteFiles(fileKeys);
    console.log("Deleted files:", fileKeys);
  } catch (error) {
    console.error("Failed to delete files:", error);
  }
}

// Helper to extract file key from URL
export function getFileKeyFromUrl(url: string): string {
  // URL format: https://utfs.io/f/CKDQ77tJ8dMQwwLGIFs5sdtkercLhU3YD8Cn7OQR9wqaxo40
  return url.split("/").pop() || "";
}
