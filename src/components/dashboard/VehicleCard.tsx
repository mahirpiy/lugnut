import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Gauge } from "lucide-react";
import Link from "next/link";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname?: string;
  currentOdometer: number;
  createdAt: Date;
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const displayName =
    vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{displayName}</CardTitle>
        <p className="text-sm text-gray-600">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Gauge className="h-4 w-4" />
          <span>{vehicle.currentOdometer.toLocaleString()} miles</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Added {vehicle.createdAt.toLocaleDateString()}</span>
        </div>
        <div className="flex space-x-2">
          <Button asChild className="flex-1">
            <Link href={`/dashboard/vehicles/${vehicle.id}`}>View Details</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/dashboard/vehicles/${vehicle.id}/jobs/new`}>
              Add Job
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
