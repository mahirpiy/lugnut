"use client";

import AddJob from "@/components/clickable/AddJob";
import { BackToVehicle } from "@/components/clickable/BackToVehicle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useVehicle } from "@/context/VehicleContext";
import { Calendar, Gauge, Plus, Wrench } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Job {
  id: string;
  title: string;
  date: string;
  odometer: number;
  laborCost: string;
  isDiy: boolean;
  shopName?: string;
  notes?: string;
  totalPartsCount: number;
  totalPartsCost: string;
  hours?: number;
}

export default function VehicleJobsPage() {
  const { vehicleId } = useParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    vehicle,
    isLoading: isVehicleLoading,
    getVehicleDisplayName,
  } = useVehicle();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch jobs
        const response = await fetch(`/api/vehicles/${vehicleId}/jobs`);
        if (response.ok) {
          const jobsData = await response.json();
          jobsData.sort((a: Job, b: Job) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          setJobs(jobsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId]);

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BackToVehicle
        vehicleId={vehicleId as string}
        displayName={getVehicleDisplayName()}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {getVehicleDisplayName()} - Maintenance History
            </CardTitle>
            <CardDescription>
              All maintenance jobs for this vehicle
            </CardDescription>
          </div>
          <AddJob vehicleId={vehicleId as string} />
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">
                No maintenance jobs yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your vehicle maintenance by adding your first job
              </p>
              <Button asChild>
                <Link href={`/garage/vehicles/${vehicleId}/jobs/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Job
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="border-muted hover:shadow-md transition-shadow cursor-pointer"
                >
                  <Link href={`/garage/vehicles/${vehicleId}/jobs/${job.id}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg hover:text-stone-600 transition-colors">
                            {job.title}
                          </h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(job.date).toLocaleDateString()}
                              </span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Gauge className="h-4 w-4" />
                              <span>{job.odometer.toLocaleString()} miles</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Wrench className="h-4 w-4" />
                              <span>
                                {job.isDiy ? "DIY" : job.shopName || "Shop"}
                              </span>
                            </span>
                          </div>
                          {job.notes && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {job.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            $
                            {(
                              parseFloat(job.laborCost) +
                              parseFloat(job.totalPartsCost)
                            ).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {job.totalPartsCount} parts
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
