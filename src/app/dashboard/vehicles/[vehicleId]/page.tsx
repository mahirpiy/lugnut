// src/app/dashboard/vehicles/[vehicleId]/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Fuel,
  Gauge,
  MapPin,
  Plus,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname?: string;
  currentOdometer: number;
  vin?: string;
  initialOdometer: number;
  purchaseDate?: string;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  date: string;
  odometer: number;
  laborCost: string;
  shopName?: string;
  notes?: string;
  totalPartsCount: number;
  totalPartsCost: string;
}

interface FuelEntry {
  id: string;
  date: string;
  odometer: number;
  gallons: string;
  totalCost?: string;
  gasStation?: string;
  mpg?: number;
  costPerGallon?: number;
}

interface VehicleDetailPageProps {
  params: {
    vehicleId: string;
  };
}

export default function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vehicle
        const vehicleResponse = await fetch(
          `/api/vehicles/${params.vehicleId}`
        );
        if (vehicleResponse.ok) {
          const vehicleData = await vehicleResponse.json();
          setVehicle(vehicleData);
        }

        // Fetch jobs
        const jobsResponse = await fetch(
          `/api/vehicles/${params.vehicleId}/jobs`
        );
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setJobs(jobsData);
        }

        // Fetch fuel entries (only for paid users)
        const fuelResponse = await fetch(
          `/api/vehicles/${params.vehicleId}/fuel`
        );
        if (fuelResponse.ok) {
          const fuelData = await fuelResponse.json();
          setFuelEntries(fuelData);
          setIsPaid(true);
        } else if (fuelResponse.status === 403) {
          // User doesn't have paid access
          setIsPaid(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.vehicleId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>Vehicle not found</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName =
    vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const totalMilesDriven = vehicle.currentOdometer - vehicle.initialOdometer;
  const totalSpent = jobs.reduce((sum, job) => {
    return sum + parseFloat(job.laborCost) + parseFloat(job.totalPartsCost);
  }, 0);

  // Calculate average MPG from fuel entries
  const validMpgEntries = fuelEntries.filter(
    (entry) => entry.mpg && entry.mpg > 0
  );
  const averageMpg =
    validMpgEntries.length > 0
      ? validMpgEntries.reduce((sum, entry) => sum + (entry.mpg || 0), 0) /
        validMpgEntries.length
      : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
            <p className="text-gray-600 mt-1">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button asChild>
              <Link href={`/dashboard/vehicles/${vehicle.id}/jobs/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Job
              </Link>
            </Button>
            {isPaid && (
              <Button asChild variant="outline">
                <Link href={`/dashboard/vehicles/${vehicle.id}/fuel/new`}>
                  <Fuel className="h-4 w-4 mr-2" />
                  Add Fuel
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Gauge className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Current Odometer
                </p>
                <p className="text-2xl font-bold">
                  {vehicle.currentOdometer.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">miles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold">{jobs.length}</p>
                <p className="text-xs text-gray-500">maintenance records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                <p className="text-xs text-gray-500">all maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Miles Driven
                </p>
                <p className="text-2xl font-bold">
                  {totalMilesDriven.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">since purchase</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isPaid ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Fuel className="h-5 w-5 text-cyan-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Average MPG
                  </p>
                  <p className="text-2xl font-bold">
                    {averageMpg > 0 ? averageMpg.toFixed(1) : "--"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {fuelEntries.length} fuel stops
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Fuel className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    Fuel Tracking
                  </p>
                  <p className="text-sm font-bold text-orange-800">
                    Pro Feature
                  </p>
                  <Button variant="outline" size="sm" className="mt-1">
                    Upgrade
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance History</CardTitle>
          <CardDescription>
            All maintenance jobs for this vehicle
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No maintenance jobs yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start tracking your vehicle maintenance by adding your first job
              </p>
              <Button asChild>
                <Link href={`/dashboard/vehicles/${vehicle.id}/jobs/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Job
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <Link
                    href={`/dashboard/vehicles/${vehicle.id}/jobs/${job.id}`}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg hover:text-blue-600 transition-colors">
                            {job.title}
                          </h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(job.date).toLocaleDateString()}
                              </span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Gauge className="h-4 w-4" />
                              <span>{job.odometer.toLocaleString()} miles</span>
                            </span>
                            {job.shopName && (
                              <span className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.shopName}</span>
                              </span>
                            )}
                          </div>
                          {job.notes && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {job.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            $
                            {(
                              parseFloat(job.laborCost) +
                              parseFloat(job.totalPartsCost)
                            ).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {job.totalPartsCount} parts
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
