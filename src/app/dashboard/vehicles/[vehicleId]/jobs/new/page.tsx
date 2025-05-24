"use client";

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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { jobSchema, type JobInput } from "@/lib/validations/job";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface Tag {
  id: string;
  name: string;
  isPreset: boolean;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname?: string;
  currentOdometer: number;
  initialOdometer: number;
}

interface NewJobPageProps {
  params: {
    vehicleId: string;
  };
}

export default function NewJobPage({ params }: NewJobPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
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
      records: [
        {
          title: "",
          tagIds: [],
          parts: [
            {
              name: "",
              partNumber: "",
              manufacturer: "",
              cost: 0,
              quantity: 1,
            },
          ],
          notes: "",
        },
      ],
    },
  });

  // Fetch vehicle and tags data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vehicle data
        const vehicleResponse = await fetch(
          `/api/vehicles/${params.vehicleId}`
        );
        if (vehicleResponse.ok) {
          const vehicleData = await vehicleResponse.json();
          setVehicle(vehicleData);
          setValue("odometer", vehicleData.currentOdometer);
        }

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
  }, [params.vehicleId, setValue]);

  const onSubmit = async (data: JobInput) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/vehicles/${params.vehicleId}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create job");
        return;
      }

      router.push(`/dashboard/vehicles/${params.vehicleId}`);
    } catch (err) {
      console.error("Error creating job:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const displayName =
    vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/dashboard/vehicles/${params.vehicleId}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to {displayName}
        </Link>
        <div className="flex items-center space-x-3">
          <Wrench className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Job</h1>
            <p className="text-gray-600">
              Record maintenance work for {displayName}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
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
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  {...register("date", {
                    setValueAs: (value) => new Date(value),
                  })}
                />
                {errors.date && (
                  <p className="text-sm text-red-600">{errors.date.message}</p>
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
                <p className="text-xs text-gray-500">
                  Current: {vehicle.currentOdometer.toLocaleString()} miles •
                  Minimum: {vehicle.initialOdometer.toLocaleString()} miles
                </p>
                {errors.odometer && (
                  <p className="text-sm text-red-600">
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
              <Label htmlFor="shopName">Shop Name (if applicable)</Label>
              <Input
                id="shopName"
                {...register("shopName")}
                placeholder="Joe's Auto Shop, DIY..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Job Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Additional notes about this job..."
                rows={3}
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
        />

        {/* Submit Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                asChild
              >
                <Link href={`/dashboard/vehicles/${params.vehicleId}`}>
                  Cancel
                </Link>
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
