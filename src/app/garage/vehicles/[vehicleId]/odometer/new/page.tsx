"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useVehicle } from "@/context/VehicleContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Gauge } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const odometerEntrySchema = z.object({
  date: z.date(),
  odometer: z
    .number()
    .int()
    .min(0, "Odometer must be positive")
    .max(10000000, "Odometer seems too high"),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

type OdometerEntryInput = z.infer<typeof odometerEntrySchema>;

export default function NewOdometerEntryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { vehicle, refetchVehicle, getVehicleDisplayName } = useVehicle();
  const { vehicleId } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OdometerEntryInput>({
    resolver: zodResolver(odometerEntrySchema),
    defaultValues: {
      date: new Date(),
      odometer: 0,
    },
  });

  // Fetch vehicle data
  useEffect(() => {
    setValue("odometer", vehicle?.currentOdometer || 0);
  }, [vehicle, setValue]);

  const onSubmit = async (data: OdometerEntryInput) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/odometer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to add odometer reading");
        return;
      }

      router.push(`/garage/vehicles/${vehicleId}`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      refetchVehicle();
    }
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/garage/vehicles/${vehicleId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to {getVehicleDisplayName()}
        </Link>
        <div className="flex items-center space-x-3">
          <Gauge className="h-8 w-8 text-stone-600" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Add Odometer Reading
            </h1>
            <p className="text-muted-foreground">
              Record a odometer reading for {getVehicleDisplayName()}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date & Time *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  {...register("date", {
                    setValueAs: (value) => new Date(value),
                  })}
                />
                {errors.date && (
                  <p className="text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="odometer">Odometer (miles) *</Label>
                <Input
                  id="odometer"
                  type="number"
                  {...register("odometer", { valueAsNumber: true })}
                  min={vehicle.initialOdometer}
                />
                <p className="text-xs text-muted-foreground">
                  Current: {vehicle.currentOdometer.toLocaleString()} miles
                </p>
                {errors.odometer && (
                  <p className="text-sm text-red-600">
                    {errors.odometer.message}
                  </p>
                )}
              </div>
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
            {isLoading ? "Adding Entry..." : "Add Odometer Entry"}
          </Button>
        </div>
      </form>
    </div>
  );
}
