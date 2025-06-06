"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Tag } from "@/lib/interfaces/tag";
import { Vehicle } from "@/lib/interfaces/vehicle";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Gauge, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const serviceIntervalSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    mileageInterval: z
      .number()
      .min(1, "Mileage interval must be at least 1")
      .optional(),
    timeInterval: z
      .number()
      .min(1, "Time interval must be at least 1")
      .optional(),
    timeUnit: z.enum(["MONTHS", "YEARS"]).optional(),
    tagIds: z.array(z.string()).min(1, "At least one tag is required"),
    notes: z
      .string()
      .max(500, "Notes must be less than 500 characters")
      .optional(),
  })
  .refine(
    (data) => data.mileageInterval || (data.timeInterval && data.timeUnit),
    {
      message: "At least one interval (mileage or time) must be specified",
    }
  );

type ServiceIntervalInput = z.infer<typeof serviceIntervalSchema>;

export default function NewServiceIntervalPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [showMileage, setShowMileage] = useState(true);
  const [showTime, setShowTime] = useState(true);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { vehicleId } = useParams();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ServiceIntervalInput>({
    resolver: zodResolver(serviceIntervalSchema),
    defaultValues: {
      name: "",
      mileageInterval: undefined,
      timeInterval: undefined,
      timeUnit: undefined,
      tagIds: [],
      notes: "",
    },
  });

  // Fetch vehicle data
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`/api/vehicles/${vehicleId}`);
        if (response.ok) {
          const vehicleData = await response.json();
          setVehicle(vehicleData);
        }

        const tagsResponse = await fetch("/api/tags");
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          setTags(tagsData);
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
        setError("Failed to load vehicle data");
      }
    };

    fetchVehicle();
  }, [vehicleId, setValue]);

  const onSubmit = async (data: ServiceIntervalInput) => {
    setIsLoading(true);
    setError("");

    // Convert years to months if necessary
    const normalizedData = {
      ...data,
      timeInterval:
        data.timeInterval && data.timeUnit === "YEARS"
          ? data.timeInterval * 12
          : data.timeInterval,
    };

    try {
      const response = await fetch(
        `/api/vehicles/${vehicleId}/service-intervals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(normalizedData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to add odometer reading");
        return;
      }

      router.push(`/garage/vehicles/${vehicleId}/service`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMileage = () => {
    if (!showMileage && !showTime) {
      return;
    }
    if (showMileage) {
      setValue("mileageInterval", undefined);
    }
    setShowMileage(!showMileage);
  };

  const toggleTime = () => {
    if (!showMileage && !showTime) {
      // Prevent removing both
      return;
    }
    if (showTime) {
      setValue("timeInterval", undefined);
      setValue("timeUnit", undefined);
    }
    setShowTime(!showTime);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : prev.length >= 5
        ? prev
        : [...prev, tagId];

      // Update the form value with the new tags
      setValue("tagIds", newTags);
      return newTags;
    });
  };

  if (!vehicle) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const displayName =
    vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/garage/vehicles/${vehicleId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to {displayName}
        </Link>
        <div className="flex items-center space-x-3">
          <Gauge className="h-8 w-8 text-stone-600" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Add Service Interval
            </h1>
            <p className="text-muted-foreground">
              Create a new service interval for {displayName}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-4">
                <div className="h-[76px]">
                  {showMileage ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="mileageInterval">
                          Mileage Interval
                        </Label>
                        {showTime && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={toggleMileage}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        id="mileageInterval"
                        type="number"
                        {...register("mileageInterval", {
                          valueAsNumber: true,
                        })}
                        min={1}
                        placeholder="Enter miles"
                      />
                      {errors.mileageInterval && (
                        <p className="text-sm text-red-600">
                          {errors.mileageInterval.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-[68px]"
                      onClick={toggleMileage}
                    >
                      Add Mileage Interval
                    </Button>
                  )}
                </div>

                <div className="h-[76px]">
                  {showTime ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="timeInterval">Time Interval</Label>
                        {showMileage && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={toggleTime}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          id="timeInterval"
                          type="number"
                          {...register("timeInterval", { valueAsNumber: true })}
                          min={1}
                          placeholder="Enter interval"
                        />
                        <RadioGroup
                          className="flex items-center"
                          defaultValue="MONTHS"
                          onValueChange={(value) =>
                            setValue("timeUnit", value as "MONTHS" | "YEARS")
                          }
                        >
                          <div className="flex items-center space-x-2 cursor-pointer">
                            <RadioGroupItem value="MONTHS" id="months" />
                            <Label htmlFor="months" className="cursor-pointer">
                              Months
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 cursor-pointer">
                            <RadioGroupItem value="YEARS" id="years" />
                            <Label htmlFor="years" className="cursor-pointer">
                              Years
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      {errors.timeInterval && (
                        <p className="text-sm text-red-600">
                          {errors.timeInterval.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-[68px]"
                      onClick={toggleTime}
                    >
                      Add Time Interval
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              You can specify a mileage interval, time interval, or both for
              this service.
            </p>
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
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Any additional notes about this fuel stop..."
                rows={3}
              />
              {errors.notes && (
                <p className="text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex space-x-4">
          <Button type="button" variant="outline" className="flex-1" asChild>
            <Link href={`/garage/vehicles/${vehicleId}`}>Cancel</Link>
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Service Interval"}
          </Button>
        </div>
      </form>
    </div>
  );
}
