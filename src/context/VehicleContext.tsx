"use client";

import { useParams } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface Vehicle {
  id: string;
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

interface VehicleContextType {
  vehicle: Vehicle | null;
  isLoading: boolean;
  error: Error | null;
  refetchVehicle: () => Promise<void>;
  getVehicleDisplayName: () => string;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const vehicleId = params.vehicleId as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVehicle = useCallback(async () => {
    if (!vehicleId) {
      setError(new Error("No vehicle ID provided"));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/vehicles/${vehicleId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch vehicle");
      }

      const data = await response.json();
      setVehicle(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch vehicle")
      );
    } finally {
      setIsLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  const getVehicleDisplayName = () => {
    if (vehicle?.nickname) {
      return vehicle.nickname;
    }
    return `${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`;
  };

  const value = {
    vehicle,
    isLoading,
    error,
    refetchVehicle: fetchVehicle,
    getVehicleDisplayName,
  };

  return (
    <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>
  );
}

export function useVehicle() {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error("useVehicle must be used within a VehicleProvider");
  }
  return context;
}
