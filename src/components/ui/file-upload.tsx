/* eslint-disable @typescript-eslint/no-explicit-any */
// Update your existing FileUpload component with better styling:

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
      onClientUploadComplete={(res: any) => {
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
        container: {
          backgroundColor: "hsl(var(--stone-50))",
          padding: "2rem",
          transition: "all 0.2s ease",
          cursor: "pointer",
        },
        uploadIcon: {
          color: "hsl(var(--stone-500))",
          width: "3rem",
          height: "3rem",
          marginBottom: "1rem",
        },
        label: {
          color: "hsl(var(--stone-800))",
          fontSize: "1rem",
          fontWeight: "500",
          marginBottom: "0.5rem",
        },
        allowedContent: {
          color: "hsl(var(--stone-500))",
          fontSize: "0.875rem",
          marginBottom: "1rem",
        },
        button: {
          backgroundColor: "hsl(var(--stone-900))",
          color: "hsl(var(--stone-50))",
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          fontSize: "0.875rem",
          fontWeight: "500",
          border: "none",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        },
      }}
    />
  );
}
