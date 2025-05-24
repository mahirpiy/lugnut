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
  UseFormRegister,
  useFieldArray,
} from "react-hook-form";

interface PartFormProps {
  control: Control<JobInput>;
  recordIndex: number;
  register: UseFormRegister<JobInput>;
  errors: FieldErrors<JobInput>;
}

export function PartForm({
  control,
  recordIndex,
  register,
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
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Parts</h4>
        <Button type="button" variant="outline" size="sm" onClick={addPart}>
          <Plus className="h-4 w-4 mr-1" />
          Add Part
        </Button>
      </div>

      {fields.map((field, partIndex) => (
        <Card key={field.id} className="border-gray-200">
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
                  <p className="text-sm text-red-600">
                    {errors.records[recordIndex].parts[partIndex].name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor={`records.${recordIndex}.parts.${partIndex}.partNumber`}
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
