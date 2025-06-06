import { UploadedPhoto } from "@/components/ui/photo-upload-modal";

export async function uploadPhoto(photo: UploadedPhoto): Promise<string> {
  if (!photo.filePath) {
    throw new Error("Photo must have a filePath");
  }

  const response = await fetch(
    `/api/storage/photo-upload?path=${photo.filePath}`
  );
  const data = await response.json();
  const { signedUrl } = data;

  const uploadResponse = await fetch(signedUrl, {
    method: "PUT",
    body: photo.file,
    headers: {
      "Content-Type": photo.file.type,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload photo");
  }

  return photo.filePath;
}

export function getPhotoFileKey(storageFolder: "parts" | "jobs") {
  return `${storageFolder}/${crypto.randomUUID()}`;
}
