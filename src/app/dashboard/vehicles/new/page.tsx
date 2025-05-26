"use client";

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
import { vehicleSchema, type VehicleInput } from "@/lib/validations/vehicle";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Car } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function NewVehiclePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      initialOdometer: 0,
      currentOdometer: 0,
    },
  });

  const initialOdometer = watch("initialOdometer");

  // Update current odometer when initial odometer changes
  const handleInitialOdometerChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value) || 0;
    setValue("initialOdometer", value);
    // If current odometer is less than initial, update it
    const currentOdometer = watch("currentOdometer");
    if (currentOdometer < value) {
      setValue("currentOdometer", value);
    }
  };

  const onSubmit = async (data: VehicleInput) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create vehicle");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex items-center space-x-3">
          <Car className="h-8 w-8 text-stone-600" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Add New Vehicle
            </h1>
            <p className="text-muted-foreground">
              Enter your vehicle information to get started
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
          <CardDescription>
            Fill out the details below to add your vehicle to Lugnut
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}

            {/* Basic Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  placeholder="Toyota, Ford, BMW..."
                  {...register("make")}
                />
                {errors.make && (
                  <p className="text-sm text-red-600">{errors.make.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  placeholder="4Runner, F-150, M3..."
                  {...register("model")}
                />
                {errors.model && (
                  <p className="text-sm text-red-600">{errors.model.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2020"
                  {...register("year", { valueAsNumber: true })}
                />
                {errors.year && (
                  <p className="text-sm text-red-600">{errors.year.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname (Optional)</Label>
                <Input
                  id="nickname"
                  placeholder="My Daily Driver, Work Truck..."
                  {...register("nickname")}
                />
                {errors.nickname && (
                  <p className="text-sm text-red-600">
                    {errors.nickname.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vin">VIN (Optional)</Label>
              <Input
                id="vin"
                placeholder="17-character Vehicle Identification Number"
                maxLength={17}
                {...register("vin")}
              />
              {errors.vin && (
                <p className="text-sm text-red-600">{errors.vin.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate (Optional)</Label>
              <Input
                id="licensePlate"
                placeholder="ABC123"
                maxLength={17}
                {...register("licensePlate")}
              />
              {errors.licensePlate && (
                <p className="text-sm text-red-600">
                  {errors.licensePlate.message}
                </p>
              )}
            </div>

            {/* Odometer Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Odometer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initialOdometer">
                    Initial Odometer (miles) *
                  </Label>
                  <Input
                    id="initialOdometer"
                    type="number"
                    placeholder="0"
                    {...register("initialOdometer", {
                      valueAsNumber: true,
                      onChange: handleInitialOdometerChange,
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Odometer reading when you acquired the vehicle
                  </p>
                  {errors.initialOdometer && (
                    <p className="text-sm text-red-600">
                      {errors.initialOdometer.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentOdometer">
                    Current Odometer (miles) *
                  </Label>
                  <Input
                    id="currentOdometer"
                    type="number"
                    placeholder="0"
                    min={initialOdometer}
                    {...register("currentOdometer", { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Current odometer reading
                  </p>
                  {errors.currentOdometer && (
                    <p className="text-sm text-red-600">
                      {errors.currentOdometer.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Purchase Date */}
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date (Optional)</Label>
              <Input
                id="purchaseDate"
                type="date"
                {...register("purchaseDate", {
                  setValueAs: (value) => (value ? new Date(value) : undefined),
                })}
              />
              {errors.purchaseDate && (
                <p className="text-sm text-red-600">
                  {errors.purchaseDate.message}
                </p>
              )}
            </div>
          </CardContent>

          <div className="px-6 pb-6">
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                asChild
              >
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Adding Vehicle..." : "Add Vehicle"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
