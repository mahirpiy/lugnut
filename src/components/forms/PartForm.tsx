"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobInput } from "@/lib/validations/job";
import { Plus, Trash2 } from "lucide-react";
import {
  Control,
  FieldErrors,
  useFieldArray,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import { PhotoUploadModal } from "../ui/photo-upload-modal";

interface PartFormProps {
  control: Control<JobInput>;
  recordIndex: number;
  register: UseFormRegister<JobInput>;
  errors: FieldErrors<JobInput>;
  onPartPhotoUpload: (
    recordIndex: number,
    partIndex: number,
    files: { url: string; name: string }[]
  ) => Promise<void>;
  watch: UseFormWatch<JobInput>;
}

export function PartForm({
  control,
  recordIndex,
  register,
  onPartPhotoUpload,
  errors,
}: PartFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `records.${recordIndex}.parts`,
  });

  const addPart = () => {
    append({
      name: "",
      partNumber: "",
      manufacturer: "",
      cost: 0,
      quantity: 1,
      url: undefined,
      partPhotos: [],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Parts</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPart}
          className="bg-muted hover:bg-muted-foreground hover:text-background"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Part
        </Button>
      </div>

      {fields.map((field, partIndex) => (
        <Card key={field.id} className="border-muted">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Part {partIndex + 1}</CardTitle>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(partIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor={`records.${recordIndex}.parts.${partIndex}.name`}
                  className="text-foreground"
                >
                  Part Name *
                </Label>
                <Input
                  {...register(
                    `records.${recordIndex}.parts.${partIndex}.name`
                  )}
                  placeholder="Brake pads, oil filter..."
                />
                {errors?.records?.[recordIndex]?.parts?.[partIndex]?.name && (
                  <p className="text-sm text-destructive">
                    {errors.records[recordIndex].parts[partIndex].name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor={`records.${recordIndex}.parts.${partIndex}.partNumber`}
                  className="text-foreground"
                >
                  Part Number
                </Label>
                <Input
                  {...register(
                    `records.${recordIndex}.parts.${partIndex}.partNumber`
                  )}
                  placeholder="ABC123..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor={`records.${recordIndex}.parts.${partIndex}.manufacturer`}
                  className="text-foreground"
                >
                  Manufacturer
                </Label>
                <Input
                  {...register(
                    `records.${recordIndex}.parts.${partIndex}.manufacturer`
                  )}
                  placeholder="OEM, Moog, NGK..."
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor={`records.${recordIndex}.parts.${partIndex}.cost`}
                  className="text-foreground"
                >
                  Cost ($)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register(
                    `records.${recordIndex}.parts.${partIndex}.cost`,
                    {
                      valueAsNumber: true,
                    }
                  )}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor={`records.${recordIndex}.parts.${partIndex}.quantity`}
                  className="text-foreground"
                >
                  Quantity
                </Label>
                <Input
                  type="number"
                  {...register(
                    `records.${recordIndex}.parts.${partIndex}.quantity`,
                    {
                      valueAsNumber: true,
                    }
                  )}
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`records.${recordIndex}.parts.${partIndex}.url`}
                className="text-foreground"
              >
                Part URL
              </Label>
              <Input
                type="url"
                {...register(`records.${recordIndex}.parts.${partIndex}.url`)}
                placeholder="https://example.com/part"
              />
            </div>

            <div className="space-y-2">
              <Label>Part Photos (Optional)</Label>
              <p className="text-xs text-muted-foreground">
                Add photos to document your parts (optional)
              </p>
              <PhotoUploadModal
                endpoint="partImage"
                onUploadComplete={(files) => {
                  onPartPhotoUpload(recordIndex, partIndex, files);
                }}
                onUploadError={(error) => {
                  console.error("Photo upload error:", error);
                }}
                maxFiles={2}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
