"use client";

import { VehicleProvider } from "@/context/VehicleContext";

export default function VehicleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VehicleProvider>{children}</VehicleProvider>;
}
