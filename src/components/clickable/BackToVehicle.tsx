"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function BackToVehicle({
  vehicleId,
  displayName,
}: {
  vehicleId: string;
  displayName: string;
}) {
  return (
    <Link
      href={`/dashboard/vehicles/${vehicleId}`}
      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      Back to {displayName}
    </Link>
  );
}
