"use client";

import { OdometerChart } from "@/components/charts/odometer-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useVehicle } from "@/context/VehicleContext";
import { OdometerEntry } from "@/lib/interfaces/odometer-entry";
import { ArrowLeft, Car } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OdometerPage() {
  const { vehicleId } = useParams();
  const { vehicle, getVehicleDisplayName } = useVehicle();
  const [entries, setEntries] = useState<OdometerEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch job details
        const odometerResponse = await fetch(
          `/api/vehicles/${vehicleId}/odometer`
        );
        if (odometerResponse.ok) {
          const odometerData = await odometerResponse.json();
          odometerData.sort(
            (a: { odometer: number }, b: { odometer: number }) =>
              b.odometer - a.odometer
          );
          setEntries(odometerData);
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/garage/vehicles/${vehicleId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to {getVehicleDisplayName()}
        </Link>
        <div className="flex items-center space-x-3">
          <Car className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {getVehicleDisplayName()}
            </h1>
          </div>
        </div>
      </div>

      {/* Odometer Entries */}
      {entries && <OdometerChart entries={entries} />}
    </div>
  );
}
