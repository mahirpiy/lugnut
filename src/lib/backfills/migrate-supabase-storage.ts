import { db } from "@/lib/db";
import { jobPhotos, partPhotos } from "@/lib/db/schema";
import { getPhotoFileKey } from "@/utils/photo-upload";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { supabaseServerClient } from "../supabase/service-client";

async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file from ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadToSupabase(
  buffer: Buffer,
  fileKey: string
): Promise<string> {
  const { error: uploadError } = await supabaseServerClient.storage
    .from(process.env.BUCKET_NAME!)
    .upload(fileKey, buffer, {
      contentType: "image/*", // Assuming JPEG, but we could detect from response headers
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload to Supabase: ${uploadError.message}`);
  }

  return fileKey;
}

export async function migratePhotos() {
  console.log("Starting photo migration...");

  // Get all photos that need migration
  const jobPhotosToMigrate = await db
    .select()
    .from(jobPhotos)
    .where(and(isNull(jobPhotos.filePath), isNotNull(jobPhotos.url)));

  const partPhotosToMigrate = await db
    .select()
    .from(partPhotos)
    .where(and(isNull(partPhotos.filePath), isNotNull(partPhotos.url)));

  console.log(`Found ${jobPhotosToMigrate.length} job photos to migrate`);
  console.log(`Found ${partPhotosToMigrate.length} part photos to migrate`);

  // Migrate job photos
  for (const photo of jobPhotosToMigrate) {
    try {
      console.log(`Migrating job photo ${photo.id} from ${photo.url}`);
      const fileBuffer = await downloadFile(photo.url!);
      const fileKey = getPhotoFileKey("jobs");
      await uploadToSupabase(fileBuffer, fileKey);

      // Update database record
      await db
        .update(jobPhotos)
        .set({ filePath: fileKey })
        .where(eq(jobPhotos.id, photo.id));

      console.log(`Successfully migrated job photo ${photo.id}`);
    } catch (error) {
      console.error(`Failed to migrate job photo ${photo.id}:`, error);
    }
  }

  // Migrate part photos
  for (const photo of partPhotosToMigrate) {
    try {
      console.log(`Migrating part photo ${photo.id} from ${photo.url}`);
      const fileBuffer = await downloadFile(photo.url!);
      const fileKey = getPhotoFileKey("parts");
      await uploadToSupabase(fileBuffer, fileKey);

      // Update database record
      await db
        .update(partPhotos)
        .set({ filePath: fileKey })
        .where(eq(partPhotos.id, photo.id));

      console.log(`Successfully migrated part photo ${photo.id}`);
    } catch (error) {
      console.error(`Failed to migrate part photo ${photo.id}:`, error);
    }
  }

  console.log("Photo migration completed!");
}
