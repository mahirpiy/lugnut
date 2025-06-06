import { supabaseServerClient } from "./service-client";

export async function getSignedUrl(fileKey: string): Promise<string> {
  const { data, error } = await supabaseServerClient.storage
    .from(process.env.BUCKET_NAME!)
    .createSignedUrl(fileKey, 3600); // 1 hour expiry

  if (error) {
    throw new Error(`Failed to get signed URL: ${error.message}`);
  }

  return data.signedUrl;
}
