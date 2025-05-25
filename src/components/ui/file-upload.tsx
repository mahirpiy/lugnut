"use client";

import { UploadDropzone } from "@/utils/uploadthing";

interface FileUploadProps {
  endpoint: "jobImage" | "partImage";
  onUploadComplete: (files: { url: string; name: string }[]) => void;
  onUploadError?: (error: Error) => void;
}

export function FileUpload({
  endpoint,
  onUploadComplete,
  onUploadError,
}: FileUploadProps) {
  return (
    <UploadDropzone
      endpoint={endpoint}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onClientUploadComplete={(res: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const files = res.map((file: any) => ({
          url: file.url,
          name: file.name,
        }));
        onUploadComplete(files);
      }}
      onUploadError={(error: Error) => {
        console.error("Upload error:", error);
        onUploadError?.(error);
      }}
      appearance={{
        button: "bg-primary text-primary-foreground hover:bg-primary/90",
        allowedContent: "text-muted-foreground text-sm",
      }}
    />
  );
}
