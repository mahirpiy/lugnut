"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceInterval } from "@/lib/interfaces/service-interval";
import { Vehicle } from "@/lib/interfaces/vehicle";
import {
  AlertTriangle,
  ArrowLeft,
  Car,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Gauge,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ServicePage() {
  const { vehicleId } = useParams();
  //   const { data: session } = useSession();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [intervals, setIntervals] = useState<ServiceInterval[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vehicle
        const vehicleResponse = await fetch(`/api/vehicles/${vehicleId}`);
        if (vehicleResponse.ok) {
          const vehicleData = await vehicleResponse.json();
          setVehicle(vehicleData);
        }

        // Fetch job details
        const intervalsResponse = await fetch(
          `/api/vehicles/${vehicleId}/service-intervals`
        );
        if (intervalsResponse.ok) {
          const intervalsData = await intervalsResponse.json();
          intervalsData.sort((a: ServiceInterval, b: ServiceInterval) =>
            a.name.localeCompare(b.name)
          );
          setIntervals(intervalsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>Vehicle not found</p>
            <Button asChild className="mt-4">
              <Link href={`/garage/vehicles/${vehicleId}`}>
                Back to Vehicle
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName =
    vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/garage/vehicles/${vehicleId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to {displayName}
        </Link>
        <div className="flex items-center space-x-3">
          <Car className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {vehicle.nickname ||
                `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            </h1>
          </div>
        </div>
      </div>

      {/* Odometer Entries */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gauge className="h-5 w-5" />
              <span>Service Intervals</span>
            </div>
            <Button asChild size="sm">
              <Link href={`/garage/vehicles/${vehicleId}/service/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service Interval
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {/* Past Due Section */}
            {intervals?.some((interval) => {
              if (!interval.lastServiced) return false;
              const milesDue = interval.mileageInterval
                ? interval.lastServiced.odometer +
                  interval.mileageInterval -
                  vehicle.currentOdometer
                : null;
              const dueDate = interval.monthInterval
                ? new Date(interval.lastServiced.date).setMonth(
                    new Date(interval.lastServiced.date).getMonth() +
                      interval.monthInterval
                  )
                : null;
              return (
                (milesDue !== null && milesDue < 0) ||
                (dueDate && dueDate < Date.now())
              );
            }) && (
              <>
                <h3 className="font-semibold text-lg flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Past Due
                </h3>
                <div className="flex flex-col gap-4">
                  {intervals
                    ?.filter((interval) => {
                      if (!interval.lastServiced) return false;
                      const milesDue = interval.mileageInterval
                        ? interval.lastServiced.odometer +
                          interval.mileageInterval -
                          vehicle.currentOdometer
                        : null;
                      const dueDate = interval.monthInterval
                        ? new Date(interval.lastServiced.date).setMonth(
                            new Date(interval.lastServiced.date).getMonth() +
                              interval.monthInterval
                          )
                        : null;
                      return (
                        (milesDue !== null && milesDue < 0) ||
                        (dueDate && dueDate < Date.now())
                      );
                    })
                    .sort((a, b) => {
                      // Sort by most overdue (either by miles or time)
                      const aMilesDue = a.mileageInterval
                        ? a.lastServiced!.odometer +
                          a.mileageInterval -
                          vehicle.currentOdometer
                        : Infinity;
                      const bMilesDue = b.mileageInterval
                        ? b.lastServiced!.odometer +
                          b.mileageInterval -
                          vehicle.currentOdometer
                        : Infinity;
                      const aDate = a.monthInterval
                        ? new Date(a.lastServiced!.date).setMonth(
                            new Date(a.lastServiced!.date).getMonth() +
                              a.monthInterval
                          )
                        : Infinity;
                      const bDate = b.monthInterval
                        ? new Date(b.lastServiced!.date).setMonth(
                            new Date(b.lastServiced!.date).getMonth() +
                              b.monthInterval
                          )
                        : Infinity;
                      return (
                        Math.min(aMilesDue, aDate) - Math.min(bMilesDue, bDate)
                      );
                    })
                    .map((interval) => (
                      <div
                        key={interval.id}
                        className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <CircleAlert className="h-5 w-5 text-destructive" />
                          <div>
                            <p className="font-medium text-foreground">
                              {interval.name}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <ServiceDueDisplay
                                interval={interval}
                                currentOdometer={vehicle.currentOdometer}
                                vehicleId={vehicleId as string}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {interval.mileageInterval && (
                            <Badge variant="outline">
                              {formatMileageInterval(interval.mileageInterval)}{" "}
                              miles
                            </Badge>
                          )}
                          {interval.monthInterval && (
                            <Badge variant="outline">
                              {calculateTimeInterval(interval.monthInterval)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}

            {/* Upcoming Section */}
            {intervals?.some((interval) => {
              if (!interval.lastServiced) return true;
              const milesDue = interval.mileageInterval
                ? interval.lastServiced.odometer +
                  interval.mileageInterval -
                  vehicle.currentOdometer
                : null;
              const dueDate = interval.monthInterval
                ? new Date(interval.lastServiced.date).setMonth(
                    new Date(interval.lastServiced.date).getMonth() +
                      interval.monthInterval
                  )
                : null;
              return (
                (milesDue === null || milesDue >= 0) &&
                (!dueDate || dueDate >= Date.now())
              );
            }) && (
              <>
                <h3 className="font-semibold text-lg">Upcoming</h3>
                <div className="flex flex-col gap-4">
                  {intervals
                    ?.filter((interval) => {
                      if (!interval.lastServiced) return true;
                      const milesDue = interval.mileageInterval
                        ? interval.lastServiced.odometer +
                          interval.mileageInterval -
                          vehicle.currentOdometer
                        : null;
                      const dueDate = interval.monthInterval
                        ? new Date(interval.lastServiced.date).setMonth(
                            new Date(interval.lastServiced.date).getMonth() +
                              interval.monthInterval
                          )
                        : null;
                      return (
                        (milesDue === null || milesDue >= 0) &&
                        (!dueDate || dueDate >= Date.now())
                      );
                    })
                    .sort((a, b) => {
                      if (!a.lastServiced && !b.lastServiced)
                        return a.name.localeCompare(b.name);
                      if (!a.lastServiced) return -1;
                      if (!b.lastServiced) return 1;

                      const aMilesDue = a.mileageInterval
                        ? a.lastServiced.odometer +
                          a.mileageInterval -
                          vehicle.currentOdometer
                        : Infinity;
                      const bMilesDue = b.mileageInterval
                        ? b.lastServiced.odometer +
                          b.mileageInterval -
                          vehicle.currentOdometer
                        : Infinity;
                      const aDate = a.monthInterval
                        ? new Date(a.lastServiced.date).setMonth(
                            new Date(a.lastServiced.date).getMonth() +
                              a.monthInterval
                          )
                        : Infinity;
                      const bDate = b.monthInterval
                        ? new Date(b.lastServiced.date).setMonth(
                            new Date(b.lastServiced.date).getMonth() +
                              b.monthInterval
                          )
                        : Infinity;
                      return (
                        Math.min(aMilesDue, aDate) - Math.min(bMilesDue, bDate)
                      );
                    })
                    .map((interval) => (
                      <div
                        key={interval.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {!interval.lastServiced ? (
                            <CircleDashed className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <CircleCheck className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium text-foreground">
                              {interval.name}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <ServiceDueDisplay
                                interval={interval}
                                currentOdometer={vehicle.currentOdometer}
                                vehicleId={vehicleId as string}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {interval.mileageInterval && (
                            <Badge variant="outline">
                              {formatMileageInterval(interval.mileageInterval)}{" "}
                              miles
                            </Badge>
                          )}
                          {interval.monthInterval && (
                            <Badge variant="outline">
                              {calculateTimeInterval(interval.monthInterval)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function calculateTimeInterval(months?: number) {
  if (!months) return null;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  switch (true) {
    case years > 0 && remainingMonths > 0:
      return `${years} years and ${remainingMonths} months`;
    case years > 0:
      return `${years} years`;
    case remainingMonths > 0:
      return `${remainingMonths} months`;
    default:
      return null;
  }
}

function formatMileageInterval(miles?: number) {
  if (!miles) return null;
  return miles.toLocaleString();
}

function ServiceDueDisplay({
  interval,
  currentOdometer,
  vehicleId,
}: {
  interval: ServiceInterval;
  currentOdometer: number;
  vehicleId: string;
}) {
  // If there's no last service record, show "Never serviced"
  if (!interval.lastServiced) {
    return (
      <>
        No records on file.{" "}
        <Link
          href={`/garage/vehicles/${vehicleId}/jobs/new`}
          className="underline"
        >
          Record now
        </Link>{" "}
        to keep your service history up to date.
      </>
    );
  }

  const milesDue = interval.mileageInterval
    ? interval.lastServiced.odometer +
      interval.mileageInterval -
      currentOdometer
    : null;

  const dueDate = interval.monthInterval
    ? new Date(interval.lastServiced.date).setMonth(
        new Date(interval.lastServiced.date).getMonth() + interval.monthInterval
      )
    : null;

  const now = new Date();
  const diffDays = dueDate
    ? Math.floor((dueDate - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isPastDue =
    (milesDue !== null && milesDue < 0) || (diffDays !== null && diffDays < 0);

  const formatTimeRemaining = (days: number) => {
    const abs = Math.abs(days);
    const years = Math.floor(abs / 365);
    const months = Math.floor((abs % 365) / 30);
    const remainingDays = abs % 30;

    let result = "";
    if (years) result += `${years}y `;
    if (months) result += `${months}m `;
    if (remainingDays) result += `${remainingDays}d`;
    return result.trim();
  };

  const getDisplayText = () => {
    if (milesDue !== null && diffDays === null) {
      // Miles only
      return milesDue > 0 ? (
        `Due in ${Math.abs(milesDue).toLocaleString()} miles`
      ) : (
        <>
          <AlertTriangle className="h-4 w-4 inline mr-1" />
          Due {Math.abs(milesDue).toLocaleString()} miles ago.{" "}
          <Link
            href={`/garage/vehicles/${vehicleId}/jobs/new`}
            className="underline"
          >
            Record job now
          </Link>
        </>
      );
    }

    if (milesDue === null && diffDays !== null) {
      // Months only
      const dueDateStr = new Date(dueDate!).toLocaleDateString();
      return diffDays > 0 ? (
        `Due in ${formatTimeRemaining(diffDays)} (${dueDateStr})`
      ) : (
        <>
          <AlertTriangle className="h-4 w-4 inline mr-1" />
          Due {formatTimeRemaining(diffDays)} ago.{" "}
          <Link
            href={`/garage/vehicles/${vehicleId}/jobs/new`}
            className="underline"
          >
            Record job now
          </Link>
        </>
      );
    }

    if (milesDue !== null && diffDays !== null) {
      // Both miles and months
      const dueDateStr = new Date(dueDate!).toLocaleDateString();
      if (!isPastDue) {
        return `Due in ${Math.abs(
          milesDue
        ).toLocaleString()} miles or on ${dueDateStr}`;
      }

      const pastDueText =
        milesDue < 0
          ? `${Math.abs(milesDue).toLocaleString()} miles ago`
          : `${formatTimeRemaining(diffDays)} ago`;

      return (
        <>
          <AlertTriangle className="h-4 w-4 inline mr-1" />
          Due {pastDueText}
        </>
      );
    }

    return null;
  };

  return <>{getDisplayText()}</>;
}
