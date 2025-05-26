// src/components/ui/photo-upload-modal.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload"; // Your existing UploadThing component
import { cn } from "@/lib/utils";
import { Eye, Upload, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface PhotoUploadModalProps {
  endpoint: "jobImage" | "partImage";
  onUploadComplete: (files: { url: string; name: string }[]) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
  disabled?: boolean;
  maxFiles?: number;
}

interface UploadedPhoto {
  url: string;
  name: string;
}

export function PhotoUploadModal({
  endpoint,
  onUploadComplete,
  onUploadError,
  className,
  disabled = false,
  maxFiles = 5,
}: PhotoUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const handleUploadComplete = (files: { url: string; name: string }[]) => {
    const newPhotos = [...uploadedPhotos, ...files];
    setUploadedPhotos(newPhotos);
    onUploadComplete(newPhotos);
  };

  const removePhoto = (index: number) => {
    const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
    setUploadedPhotos(newPhotos);
    onUploadComplete(newPhotos);
  };

  const canUploadMore = uploadedPhotos.length < maxFiles;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("flex items-center space-x-2", className)}
            disabled={disabled}
          >
            <Upload className="h-4 w-4" />
            <span>
              {uploadedPhotos.length > 0
                ? `${uploadedPhotos.length} photo${
                    uploadedPhotos.length > 1 ? "s" : ""
                  } added`
                : "Add Photos"}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Job Photos</DialogTitle>
            <DialogDescription>
              Add photos to document your work. Images will be stored securely.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {canUploadMore && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-2">
                <FileUpload
                  endpoint={endpoint}
                  onUploadComplete={handleUploadComplete}
                  onUploadError={onUploadError}
                />
              </div>
            )}

            {/* Uploaded Photos Gallery */}
            {uploadedPhotos.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    Uploaded Photos ({uploadedPhotos.length}/{maxFiles})
                  </h4>
                  {!canUploadMore && (
                    <p className="text-sm text-gray-500">
                      Maximum photos reached
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {uploadedPhotos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative group border rounded-lg overflow-hidden bg-gray-50"
                    >
                      <div className="aspect-square relative">
                        <Image
                          src={photo.url}
                          alt={photo.name}
                          width={1000}
                          height={1000}
                          className="w-full h-full object-cover"
                        />

                        {/* Overlay with actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setPreviewPhoto(photo.url)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removePhoto(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-2">
                        <p className="text-xs text-gray-600 truncate">
                          {photo.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Preview Modal */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Photo Preview</DialogTitle>
          </DialogHeader>
          {previewPhoto && (
            <div className="flex justify-center">
              <Image
                src={previewPhoto}
                alt="Preview"
                width={1000}
                height={1000}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
