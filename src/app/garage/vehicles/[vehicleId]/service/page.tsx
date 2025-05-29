"use client";

import ServiceIntervalTile from "@/components/service-interval/interval-tile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceInterval } from "@/lib/interfaces/service-interval";
import { Vehicle } from "@/lib/interfaces/vehicle";
import { ArrowLeft, Car, Gauge, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ServicePage() {
  const { vehicleId } = useParams();
  const { data: session } = useSession();
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
          intervalsData.sort(
            (a: { interval: number }, b: { interval: number }) =>
              b.interval - a.interval
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
            {session?.user?.hasActiveSubscription && (
              <Button asChild size="sm">
                <Link href={`/garage/vehicles/${vehicleId}/odometer/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service Interval
                </Link>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {intervals &&
              intervals.map((interval) => (
                <ServiceIntervalTile key={interval.id} interval={interval} />
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
