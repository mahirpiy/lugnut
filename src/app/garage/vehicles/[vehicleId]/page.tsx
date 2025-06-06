"use client";

import AddJob from "@/components/clickable/AddJob";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useVehicle } from "@/context/VehicleContext";
import { ServiceInterval } from "@/lib/interfaces/service-interval";
import {
  calculateDiyLaborSavedString,
  calculateMilesPerTank,
  formatDiyHours,
  milesDrivenPerDay,
} from "@/utils/vehicleInsights";
import {
  ArrowLeft,
  DollarSign,
  Fuel,
  Gauge,
  Hourglass,
  Lock,
  Wrench,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const { vehicleId } = useParams();
  const { data: session } = useSession();

  const {
    vehicle,
    isLoading: isVehicleLoading,
    getVehicleDisplayName,
  } = useVehicle();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [serviceIntervals, setServiceIntervals] = useState<ServiceInterval[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch jobs
        const jobsResponse = await fetch(`/api/vehicles/${vehicleId}/jobs`);
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          jobsData.sort((a: Job, b: Job) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          setJobs(jobsData);
        }

        // Fetch fuel entries (only for paid users)
        const fuelResponse = await fetch(`/api/vehicles/${vehicleId}/fuel`);
        if (fuelResponse.ok) {
          const fuelData = await fuelResponse.json();
          setFuelEntries(fuelData);
        }

        // Fetch service intervals
        const intervalsResponse = await fetch(
          `/api/vehicles/${vehicleId}/service-intervals`
        );
        if (intervalsResponse.ok) {
          const intervalsData = await intervalsResponse.json();
          setServiceIntervals(intervalsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId]);

  const totalDiyHours = jobs.reduce((sum, job) => {
    if (job.isDiy && job.hours && job.hours > 0) {
      return sum + job.hours;
    }
    return sum;
  }, 0);

  if (loading || isVehicleLoading) {
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
              <Link href="/garage">Back to Garage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const { count, message } = getServiceIntervalStatus(
    serviceIntervals,
    vehicle.currentOdometer
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/garage"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Garage
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {getVehicleDisplayName()}
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
            <AddJob vehicleId={vehicle.id} />
            {session?.user?.hasActiveSubscription && (
              <Button asChild variant="outline">
                <Link href={`/garage/vehicles/${vehicle.id}/fuel/new`}>
                  <Fuel className="h-4 w-4 mr-2" />
                  Add Fuel
                </Link>
              </Button>
            )}
            {session?.user?.hasActiveSubscription && (
              <Button asChild variant="outline">
                <Link href={`/garage/vehicles/${vehicle.id}/odometer/new`}>
                  <Gauge className="h-4 w-4 mr-2" />
                  Add Odometer
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {!session?.user?.hasActiveSubscription && (
        <Card className="mb-6 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-orange-800 dark:text-orange-400">
                  Upgrade your garage
                </h3>
                <p className="text-orange-700/90 dark:text-orange-400/90">
                  Track an unlimited number of vehicles and jobs, monitor fuel
                  economy and unlock advanced insights about your vehicle.
                </p>
              </div>
              <Link href="/garage/upgrade">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="cursor-pointer hover:bg-accent/80 hover:scale-[1.02] transition-all duration-200">
          <Link href={`/garage/vehicles/${vehicle.id}/odometer`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Gauge className="h-8 w-8 text-blue-600" />
                <div className="flex-1">
                  <p className="text-lg font-medium text-muted-foreground">
                    Odometer
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {vehicle.currentOdometer.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
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
          </Link>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/80 hover:scale-[1.02] transition-all duration-200">
          <Link href={`/garage/vehicles/${vehicle.id}/service`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Hourglass className="h-8 w-8 text-purple-600" />
                <div className="flex-1">
                  <p className="text-lg font-medium text-muted-foreground">
                    Service Intervals
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {typeof count === "number" && count > 0
                      ? count.toLocaleString()
                      : "--"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/80 hover:scale-[1.02] transition-all duration-200">
          <Link href={`/garage/vehicles/${vehicle.id}/jobs`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Wrench className="h-8 w-8 text-green-600" />
                <div className="flex-1">
                  <p className="text-lg font-medium text-muted-foreground">
                    Maintenance Jobs
                  </p>
                  <p className="text-3xl font-bold mt-2">{jobs.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {`${formatDiyHours(totalDiyHours)}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="relative group md:col-span-3 lg:col-span-1">
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <p className="text-muted-foreground font-medium">
              Detailed cost analysis coming soon
            </p>
          </div>
          <CardContent className="p-8">
            <div className="flex items-center space-x-4">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div className="flex-1">
                <p className="text-lg font-medium text-muted-foreground">
                  Costs
                </p>
                <p className="text-4xl font-bold mt-2">
                  ${totalSpent.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {`${calculateDiyLaborSavedString(totalDiyHours)}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {session?.user?.hasActiveSubscription ? (
          <Card className="relative group md:col-span-3 lg:col-span-1">
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <p className="text-muted-foreground font-medium">
                Detailed fuel analysis coming soon
              </p>
            </div>
            <CardContent className="p-8">
              <div className="flex items-center space-x-4">
                <Fuel className="h-8 w-8 text-cyan-600" />
                <div className="flex-1">
                  <p className="text-lg font-medium text-muted-foreground">
                    Fuel Economy
                  </p>
                  <p className="text-4xl font-bold mt-2">
                    {averageMpg > 0 ? `${averageMpg.toFixed(1)} MPG` : "--"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {`${calculateMilesPerTank(
                      fuelEntries.map((entry) => entry.odometer)
                    )}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="relative md:col-span-3 lg:col-span-1">
            <div className="absolute inset-0 backdrop-blur-[1px] bg-background/60 z-10 flex items-center justify-center">
              <Button
                asChild
                className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900"
              >
                <Link href="/garage/upgrade">
                  <Lock className="h-4 w-4 mr-2 text-orange-800 dark:text-orange-400" />
                  <p className="font-semibold text-orange-800 dark:text-orange-400">
                    Upgrade to track fuel records
                  </p>
                </Link>
              </Button>
            </div>
            <CardContent className="p-8">
              <div className="flex items-center space-x-4">
                <Fuel className="h-8 w-8 text-cyan-600" />
                <div className="flex-1">
                  <p className="text-lg font-medium text-muted-foreground">
                    Average MPG
                  </p>
                  <p className="text-4xl font-bold mt-2">23.4 MPG</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upgrade to track fuel economy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getServiceIntervalStatus(
  intervals: ServiceInterval[],
  currentOdometer: number
) {
  if (!intervals?.length) {
    return { count: 0, message: "No service intervals" };
  }

  // Check for intervals without records
  const noRecordIntervals = intervals.filter(
    (interval) => !interval.lastServiced
  );

  // Check for past due intervals
  const pastDueIntervals = intervals.filter((interval) => {
    if (!interval.lastServiced) return false;

    const milesDue = interval.mileageInterval
      ? interval.lastServiced.odometer +
        interval.mileageInterval -
        currentOdometer
      : null;

    const dueDate = interval.monthInterval
      ? new Date(interval.lastServiced.date).setMonth(
          new Date(interval.lastServiced.date).getMonth() +
            interval.monthInterval
        )
      : null;

    return (
      (milesDue !== null && milesDue < 0) || (dueDate && dueDate < Date.now())
    );
  });

  if (pastDueIntervals.length > 0) {
    return {
      count: pastDueIntervals.length,
      message: "service items past due",
    };
  }

  if (noRecordIntervals.length > 0) {
    return {
      count: noRecordIntervals.length,
      message: "missing service records",
    };
  }

  // Find next upcoming service
  const upcomingServices = intervals
    .filter((interval) => interval.lastServiced)
    .map((interval) => {
      const milesDue = interval.mileageInterval
        ? interval.lastServiced!.odometer +
          interval.mileageInterval -
          currentOdometer
        : Infinity;

      return {
        name: interval.name,
        milesDue: milesDue,
      };
    })
    .filter((service) => service.milesDue > 0)
    .sort((a, b) => a.milesDue - b.milesDue);

  if (upcomingServices.length > 0) {
    const nextService = upcomingServices[0];
    return {
      count: nextService.milesDue,
      message: `miles until ${nextService.name}`,
    };
  }

  return { count: 0, message: "No upcoming services" };
}
