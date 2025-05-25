"use client";

import { VehicleCard } from "@/components/dashboard/VehicleCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Car, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Vehicle {
  uuid: string;
  make: string;
  model: string;
  year: number;
  nickname?: string;
  licensePlate?: string;
  currentOdometer: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch("/api/vehicles");
        if (response.ok) {
          const data = await response.json();
          setVehicles(
            data.map((v: Vehicle) => ({
              ...v,
              createdAt: new Date(v.createdAt),
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchVehicles();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const canAddVehicle = session?.user?.isPaid || vehicles.length < 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Vehicles</h1>
          <p className="text-muted-foreground mt-1">
            Manage your vehicle maintenance records
          </p>
        </div>
        {canAddVehicle && (
          <Button asChild>
            <Link href="/dashboard/vehicles/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Link>
          </Button>
        )}
      </div>

      {vehicles.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-xl mb-2">No vehicles yet</CardTitle>
            <CardDescription className="mb-4">
              Add your first vehicle to start tracking maintenance records
            </CardDescription>
            {canAddVehicle && (
              <Button asChild>
                <Link href="/dashboard/vehicles/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Vehicle
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.uuid}
                vehicle={{
                  ...vehicle,
                  createdAt: new Date(vehicle.createdAt),
                }}
              />
            ))}
          </div>
          {!canAddVehicle && (
            <Card className="mt-6 border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-orange-900">
                      Vehicle Limit Reached
                    </h3>
                    <p className="text-sm text-orange-700">
                      Free accounts are limited to 1 vehicle. Upgrade to add
                      unlimited vehicles.
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
