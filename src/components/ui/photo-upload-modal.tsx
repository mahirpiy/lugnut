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
import { cn } from "@/lib/utils";
import { getPhotoFileKey } from "@/utils/photo-upload";
import { Eye, Upload, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useState } from "react";

interface PhotoUploadModalProps {
  onUploadComplete: (files: UploadedPhoto[]) => void;
  className?: string;
  disabled?: boolean;
  maxFiles?: number;
  storageFolder: "jobs" | "parts";
}

export interface UploadedPhoto {
  file: File;
  previewUrl: string;
  name: string;
  filePath: string;
}

export function PhotoUploadModal({
  onUploadComplete,
  storageFolder,
  className,
  disabled = false,
  maxFiles = 5,
}: PhotoUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: UploadedPhoto[] = [];

    Array.from(files).forEach((file) => {
      if (uploadedPhotos.length + newPhotos.length >= maxFiles) return;

      const previewUrl = URL.createObjectURL(file);
      newPhotos.push({
        file,
        previewUrl,
        name: file.name,
        filePath: getPhotoFileKey(storageFolder),
      });
    });

    const updatedPhotos = [...uploadedPhotos, ...newPhotos];
    setUploadedPhotos(updatedPhotos);
    onUploadComplete(updatedPhotos);
  };

  const removePhoto = (index: number) => {
    // Clean up object URL to prevent memory leaks
    URL.revokeObjectURL(uploadedPhotos[index].previewUrl);

    const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
    setUploadedPhotos(newPhotos);
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
              <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/50 p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="rounded-full bg-background p-3 ring-1 ring-border">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Upload photos</h3>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop or click to upload
                    </p>
                  </div>
                  <label className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="secondary" size="sm">
                      Select Files
                    </Button>
                  </label>
                </div>
              </div>
            )}

            {/* Uploaded Photos Gallery */}
            {uploadedPhotos.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium leading-none">
                    Uploaded Photos ({uploadedPhotos.length}/{maxFiles})
                  </h4>
                  {!canUploadMore && (
                    <p className="text-sm text-muted-foreground">
                      Maximum photos reached
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedPhotos.map((photo, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-lg bg-background ring-1 ring-border"
                    >
                      <Image
                        src={photo.previewUrl}
                        alt={photo.name}
                        width={1000}
                        height={1000}
                        className="h-full w-full object-cover transition-all"
                      />

                      {/* Overlay with actions */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-all group-hover:opacity-100">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => setPreviewPhoto(photo.previewUrl)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removePhoto(index)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                        <p className="truncate text-xs text-white">
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
