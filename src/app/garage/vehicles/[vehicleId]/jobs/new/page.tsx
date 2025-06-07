"use client";

import { BackToVehicle } from "@/components/clickable/BackToVehicle";
import { RecordForm } from "@/components/forms/RecordForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PhotoUploadModal,
  UploadedPhoto,
} from "@/components/ui/photo-upload-modal";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useVehicle } from "@/context/VehicleContext";
import { Tag } from "@/lib/interfaces/tag";
import { jobSchema, type JobInput } from "@/lib/validations/job";
import { uploadPhoto } from "@/utils/photo-upload";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wrench } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function NewJobPage() {
  const { vehicleId } = useParams();

  const { vehicle, refetchVehicle, getVehicleDisplayName } = useVehicle();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [jobPhotos, setJobPhotos] = useState<UploadedPhoto[]>([]);
  const [partPhotos, setPartPhotos] = useState<UploadedPhoto[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<JobInput>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      date: new Date(),
      odometer: 0,
      laborCost: 0,
      isDiy: true,
      url: "",
      hours: 0,
      records: [
        {
          title: "",
          tagIds: [],
          parts: [],
          notes: "",
        },
      ],
      jobPhotos: [],
    },
  });

  const isDiy = watch("isDiy");

  // Fetch vehicle and tags data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tags
        const tagsResponse = await fetch("/api/tags");
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          setTags(tagsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
      }
    };

    fetchData();
  }, [vehicleId, setValue]);

  const onSubmit = async (data: JobInput) => {
    setIsLoading(true);
    setError("");

    try {
      // Remove empty URL before submission
      if (!data.url || data.url === "") {
        delete data.url;
      }

      // Upload job photos
      const uploadedJobPhotos = await Promise.all(
        jobPhotos.map(async (photo) => {
          return await uploadPhoto(photo);
        })
      );

      const partPhotoMap = new Map<string, string[]>();

      const partPhotosByKey = partPhotos.reduce((acc, photo) => {
        acc[photo.filePath] = photo;
        return acc;
      }, {} as Record<string, UploadedPhoto>);

      // Upload all part photos and store paths
      for (const record of data.records) {
        for (const part of record.parts) {
          if (part.partPhotos && part.partPhotos.length > 0) {
            const uploadedPaths = await Promise.all(
              part.partPhotos.map(async (photoKey) => {
                const photo = partPhotosByKey[photoKey];
                return await uploadPhoto(photo);
              })
            );
            partPhotoMap.set(part.name, uploadedPaths);
          }
        }
      }

      const response = await fetch(`/api/vehicles/${vehicleId}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          jobPhotos: uploadedJobPhotos,
          records: data.records.map((record) => ({
            ...record,
            parts: record.parts.map((part) => ({
              ...part,
              partPhotos: part.partPhotos,
            })),
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create job");
        return;
      }

      router.push(`/garage/vehicles/${vehicleId}`);
    } catch (err) {
      console.error("Error creating job:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      refetchVehicle();
    }
  };

  const handleFormExit = async () => {
    router.push(`/garage/vehicles/${vehicleId}`);
  };

  const onPartPhotoUpload = async (
    recordIndex: number,
    partIndex: number,
    files: UploadedPhoto[]
  ) => {
    setPartPhotos(files);
    setValue(
      `records.${recordIndex}.parts.${partIndex}.partPhotos`,
      files.map((file) => file.filePath)
    );
  };

  if (!vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackToVehicle
          vehicleId={vehicleId as string}
          displayName={getVehicleDisplayName()}
        />
        <div className="flex items-center space-x-3">
          <Wrench className="h-8 w-8 text-stone-600" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add New Job</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded">
            {error}
          </div>
        )}

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
            <CardDescription>
              Basic details about the maintenance job
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Brake service, oil change, tune-up..."
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  {...register("date", {
                    setValueAs: (value) => new Date(value),
                  })}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">
                    {errors.date.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="odometer">Odometer (miles) *</Label>
                <Input
                  id="odometer"
                  type="number"
                  {...register("odometer", { valueAsNumber: true })}
                  min={vehicle.initialOdometer}
                />
                <p className="text-xs text-muted-foreground">
                  Current: {vehicle.currentOdometer.toLocaleString()} miles •
                  Minimum: {vehicle.initialOdometer.toLocaleString()} miles
                </p>
                {errors.odometer && (
                  <p className="text-sm text-destructive">
                    {errors.odometer.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="laborCost">Labor Cost ($)</Label>
                <Input
                  id="laborCost"
                  type="number"
                  step="0.01"
                  {...register("laborCost", { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Work Type *</Label>
              <div className="flex items-center space-x-3">
                <span
                  className={`text-sm ${
                    !isDiy
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Shop
                </span>
                <Switch
                  checked={isDiy}
                  onCheckedChange={(checked) => setValue("isDiy", checked)}
                  aria-label="Toggle between DIY and Shop work"
                />
                <span
                  className={`text-sm ${
                    isDiy
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  DIY
                </span>
              </div>
            </div>

            {!isDiy && (
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name *</Label>
                <Input
                  id="shopName"
                  {...register("shopName")}
                  placeholder="Enter shop or business name"
                />
                {errors.shopName && (
                  <p className="text-sm text-destructive">
                    {errors.shopName.message}
                  </p>
                )}
              </div>
            )}

            {isDiy && (
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty *</Label>
                <p className="text-xs text-muted-foreground">
                  How difficult was this job?
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-1/2">
                    <Slider
                      id="difficulty"
                      className="text-muted-foreground"
                      value={[watch("difficulty") || 0]}
                      onValueChange={(value) =>
                        setValue("difficulty", value[0])
                      }
                      min={0}
                      max={10}
                      step={1}
                    />
                  </div>
                  <span className="min-w-[3ch] text-sm">
                    {watch("difficulty") || 0}/10
                  </span>
                </div>
                {errors.difficulty && (
                  <p className="text-sm text-destructive">
                    {errors.difficulty.message}
                  </p>
                )}

                <Label htmlFor="hours">Time Spent</Label>
                <p className="text-xs text-muted-foreground">
                  How long did it take you to do this job?
                </p>
                <Input
                  id="hours"
                  {...register("hours", {
                    valueAsNumber: true,
                    setValueAs: (value) =>
                      value === "" ? undefined : parseFloat(value),
                  })}
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="Enter hours"
                />

                <Label htmlFor="url">Tutorial URL</Label>
                <p className="text-xs text-muted-foreground">
                  Optional: Did you follow a tutorial for this job?
                </p>
                <Input
                  id="url"
                  {...register("url")}
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Job Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Additional notes about this job..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Job Photos (Optional)</Label>
              <p className="text-xs text-muted-foreground">
                Add photos to document your work (optional)
              </p>
              <PhotoUploadModal
                storageFolder="jobs"
                onUploadComplete={(files) => {
                  setJobPhotos(files);
                  setValue(
                    "jobPhotos",
                    files.map((file) => file.filePath)
                  );
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Records Section */}
        <RecordForm
          control={control}
          register={register}
          errors={errors}
          tags={tags}
          watch={watch}
          setValue={setValue}
          onPartPhotoUpload={onPartPhotoUpload}
        />

        {/* Submit Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleFormExit}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Creating Job..." : "Create Job"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
