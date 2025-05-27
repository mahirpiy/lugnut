"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { JobInput } from "@/lib/validations/job";
import { Plus, Trash2 } from "lucide-react";
import {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  useFieldArray,
} from "react-hook-form";
import { PartForm } from "./PartForm";

interface Tag {
  id: string;
  name: string;
  isPreset: boolean;
}

interface RecordFormProps {
  control: Control<JobInput>;
  register: UseFormRegister<JobInput>;
  errors: FieldErrors<JobInput>;
  tags: Tag[];
  watch: UseFormWatch<JobInput>;
  setValue: UseFormSetValue<JobInput>;
  onPartPhotoUpload: (
    recordIndex: number,
    partIndex: number,
    files: { url: string; name: string }[]
  ) => Promise<void>;
}

export function RecordForm({
  control,
  register,
  errors,
  tags,
  watch,
  setValue,
  onPartPhotoUpload,
}: RecordFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "records",
  });

  const addRecord = () => {
    append({
      title: "",
      tagIds: [],
      parts: [
        {
          name: "",
          partNumber: "",
          manufacturer: "",
          cost: 0,
          quantity: 1,
          partPhotos: [],
        },
      ],
      notes: "",
    });
  };

  const toggleTag = (recordIndex: number, tagId: string) => {
    const currentTags = watch(`records.${recordIndex}.tagIds`) || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id: string) => id !== tagId)
      : [...currentTags, tagId];

    setValue(`records.${recordIndex}.tagIds`, newTags);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Records</h3>
        <Button type="button" variant="outline" onClick={addRecord}>
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      {fields.map((field, recordIndex) => {
        const selectedTags = watch(`records.${recordIndex}.tagIds`) || [];

        return (
          <Card key={field.id} className="border-muted">
            <CardHeader className="bg-muted p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">
                  Record {recordIndex + 1}
                </CardTitle>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(recordIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Record Title */}
              <div className="space-y-2">
                <Label htmlFor={`records.${recordIndex}.title`}>
                  Record Title *
                </Label>
                <Input
                  {...register(`records.${recordIndex}.title`)}
                  placeholder="Front brake pads, oil change..."
                />
                {errors?.records?.[recordIndex]?.title && (
                  <p className="text-sm text-destructive">
                    {errors.records[recordIndex].title.message}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags * (Select at least 1, max 5)</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={
                        selectedTags.includes(tag.id) ? "default" : "outline"
                      }
                      className={cn(
                        "cursor-pointer text-sm px-3 py-1.5",
                        selectedTags.includes(tag.id)
                          ? "hover:bg-primary/80"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => toggleTag(recordIndex, tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
                {errors?.records?.[recordIndex]?.tagIds && (
                  <p className="text-sm text-destructive">
                    {errors.records[recordIndex].tagIds.message}
                  </p>
                )}
              </div>

              {/* Parts */}
              <PartForm
                control={control}
                recordIndex={recordIndex}
                register={register}
                errors={errors}
                watch={watch}
                onPartPhotoUpload={onPartPhotoUpload}
              />

              {/* Record Notes */}
              <div className="space-y-2">
                <Label htmlFor={`records.${recordIndex}.notes`}>
                  Record Notes
                </Label>
                <Textarea
                  {...register(`records.${recordIndex}.notes`)}
                  placeholder="Additional notes for this record..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
