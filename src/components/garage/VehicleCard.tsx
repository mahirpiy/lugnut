import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Vehicle } from "@/lib/interfaces/vehicle";
import { Gauge, Gift, IdCard } from "lucide-react";
import Link from "next/link";
interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  console.log(vehicle);
  const displayName =
    vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  const daysOwned = vehicle.purchaseDate
    ? Math.floor(
        (new Date().getTime() - new Date(vehicle.purchaseDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{displayName}</CardTitle>
        {vehicle.nickname && (
          <p className="text-sm text-muted-foreground">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Gauge className="h-4 w-4" />
          <span>{vehicle.currentOdometer.toLocaleString()} miles</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <IdCard className="h-4 w-4" />
          <span>{vehicle.licensePlate}</span>
        </div>
        {daysOwned && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Gift className="h-4 w-4" />
            <span>{`Bought ${daysOwned} days ago`}</span>
          </div>
        )}
        <div className="flex space-x-2">
          <Button asChild className="flex-1">
            <Link href={`/garage/vehicles/${vehicle.id}`}>View Details</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/garage/vehicles/${vehicle.id}/jobs/new`}>
              Add Job
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
