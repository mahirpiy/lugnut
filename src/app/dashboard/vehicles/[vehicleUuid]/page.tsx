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
  calculateDiyLaborSavedString,
  calculateMilesPerTank,
  formatDiyHours,
  milesDrivenPerDay,
} from "@/utils/vehicleInsights";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Fuel,
  Gauge,
  Map,
  Plus,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Vehicle {
  uuid: string;
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
  uuid: string;
  title: string;
  date: string;
  odometer: number;
  laborCost: string;
  isDiy: boolean; // Add isDiy field
  shopName?: string;
  notes?: string;
  totalPartsCount: number;
  totalPartsCost: string;
  hours?: number;
}

interface FuelEntry {
  uuid: string;
  date: string;
  odometer: number;
  gallons: string;
  totalCost?: string;
  gasStation?: string;
  mpg?: number;
  costPerGallon?: number;
}

export default function VehicleDetailPage() {
  const { vehicleUuid } = useParams();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vehicle
        const vehicleResponse = await fetch(`/api/vehicles/${vehicleUuid}`);
        if (vehicleResponse.ok) {
          const vehicleData = await vehicleResponse.json();
          setVehicle(vehicleData);
        }

        // Fetch jobs
        const jobsResponse = await fetch(`/api/vehicles/${vehicleUuid}/jobs`);
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          jobsData.sort((a: Job, b: Job) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          setJobs(jobsData);
        }

        // Fetch fuel entries (only for paid users)
        const fuelResponse = await fetch(`/api/vehicles/${vehicleUuid}/fuel`);
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
  }, [vehicleUuid]);

  const totalDiyHours = jobs.reduce((sum, job) => {
    if (job.isDiy && job.hours && job.hours > 0) {
      return sum + job.hours;
    }
    return sum;
  }, 0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-48 bg-muted rounded"></div>
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
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {displayName}
            </h1>
            {vehicle.nickname && (
              <p className="text-muted-foreground mt-1">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            )}
            {vehicle.vin && (
              <p className="text-muted-foreground mt-1">{vehicle.vin}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button asChild>
              <Link href={`/dashboard/vehicles/${vehicle.uuid}/jobs/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Job
              </Link>
            </Button>
            {isPaid && (
              <Button asChild variant="outline">
                <Link href={`/dashboard/vehicles/${vehicle.uuid}/fuel/new`}>
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
                <p className="text-sm font-medium text-muted-foreground">
                  Current Odometer
                </p>
                <p className="text-2xl font-bold">
                  {vehicle.currentOdometer.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {milesDrivenPerDay(
                    vehicle.initialOdometer,
                    vehicle.currentOdometer,
                    new Date(vehicle.purchaseDate || ""),
                    new Date()
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Jobs
                </p>
                <p className="text-2xl font-bold">{jobs.length}</p>
                <p className="text-xs text-muted-foreground">
                  {`${formatDiyHours(totalDiyHours)}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Spent
                </p>
                <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {`${calculateDiyLaborSavedString(totalDiyHours)}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Map className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Miles Driven
                </p>
                <p className="text-2xl font-bold">
                  {totalMilesDriven.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">since purchase</p>
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Average MPG
                  </p>
                  <p className="text-2xl font-bold">
                    {averageMpg > 0 ? averageMpg.toFixed(1) : "--"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {`${calculateMilesPerTank(
                      fuelEntries.map((entry) => entry.odometer)
                    )}`}
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
              <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">
                No maintenance jobs yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your vehicle maintenance by adding your first job
              </p>
              <Button asChild>
                <Link href={`/dashboard/vehicles/${vehicle.uuid}/jobs/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Job
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card
                  key={job.uuid}
                  className="border-muted hover:shadow-md transition-shadow cursor-pointer"
                >
                  <Link
                    href={`/dashboard/vehicles/${vehicle.uuid}/jobs/${job.uuid}`}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg hover:text-stone-600 transition-colors">
                            {job.title}
                          </h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
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
                            <span className="flex items-center space-x-1">
                              <Wrench className="h-4 w-4" />
                              <span>
                                {job.isDiy ? "DIY" : job.shopName || "Shop"}
                              </span>
                            </span>
                          </div>
                          {job.notes && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
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
                          <div className="text-sm text-muted-foreground">
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
