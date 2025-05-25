"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Gauge,
  Package,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Part {
  uuid: string;
  name: string;
  partNumber?: string;
  manufacturer?: string;
  cost: string;
  quantity: number;
}

interface Tag {
  uuid: string;
  name: string;
  isPreset: boolean;
}

interface Record {
  uuid: string;
  title: string;
  notes?: string;
  parts: Part[];
  tags: Tag[];
  totalCost: number;
}

interface Job {
  uuid: string;
  title: string;
  date: string;
  odometer: number;
  laborCost: string;
  isDiy: boolean; // Add isDiy field
  shopName?: string;
  notes?: string;
  records: Record[];
  totalPartsCost: number;
  totalCost: number;
}

interface Vehicle {
  uuid: string;
  make: string;
  model: string;
  year: number;
  nickname?: string;
}

interface JobDetailPageProps {
  params: {
    vehicleUuid: string;
    jobUuid: string;
  };
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vehicle
        const vehicleResponse = await fetch(
          `/api/vehicles/${params.vehicleUuid}`
        );
        if (vehicleResponse.ok) {
          const vehicleData = await vehicleResponse.json();
          setVehicle(vehicleData);
        }

        // Fetch job details
        const jobResponse = await fetch(
          `/api/vehicles/${params.vehicleUuid}/jobs/${params.jobUuid}`
        );
        if (jobResponse.ok) {
          const jobData = await jobResponse.json();
          setJob(jobData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.vehicleUuid, params.jobUuid]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!job || !vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>Job not found</p>
            <Button asChild className="mt-4">
              <Link href={`/dashboard/vehicles/${params.vehicleUuid}`}>
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
          href={`/dashboard/vehicles/${params.vehicleUuid}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to {displayName}
        </Link>
        <div className="flex items-center space-x-3">
          <Wrench className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-600">Maintenance job for {displayName}</p>
          </div>
        </div>
      </div>

      {/* Job Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Job Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-blue-500 bg-blue-100 rounded-lg p-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="font-semibold">
                  {new Date(job.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Gauge className="h-8 w-8 text-green-500 bg-green-100 rounded-lg p-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Odometer</p>
                <p className="font-semibold">
                  {job.odometer.toLocaleString()} miles
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Wrench className="h-8 w-8 text-purple-500 bg-purple-100 rounded-lg p-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Work Type</p>
                <p className="font-semibold">
                  {job.isDiy ? "DIY" : job.shopName || "Shop Work"}
                </p>
                {!job.isDiy && job.shopName && (
                  <p className="text-xs text-gray-500">{job.shopName}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-orange-500 bg-orange-100 rounded-lg p-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="font-semibold text-lg">
                  ${job.totalCost.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {job.notes && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-2">Job Notes</h4>
              <p className="text-gray-700">{job.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Cost Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Parts Total</span>
              <span className="font-semibold">
                ${job.totalPartsCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Labor Cost</span>
              <span className="font-semibold">
                ${parseFloat(job.laborCost).toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-green-600">
                ${job.totalCost.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Maintenance Records</h2>

        {job.records.map((record) => (
          <Card key={record.uuid} className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{record.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {record.tags.map((tag) => (
                      <Badge
                        key={tag.uuid}
                        variant={tag.isPreset ? "default" : "secondary"}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    ${record.totalCost.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {record.parts.length} parts
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Parts List */}
              <div className="space-y-4">
                {record.parts.map((part) => (
                  <div
                    key={part.uuid}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{part.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {part.partNumber && (
                            <span>PN: {part.partNumber}</span>
                          )}
                          {part.manufacturer && (
                            <span>Brand: {part.manufacturer}</span>
                          )}
                          <span>Qty: {part.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${parseFloat(part.cost).toFixed(2)}
                      </p>
                      {part.quantity > 1 && (
                        <p className="text-sm text-gray-600">
                          ${(parseFloat(part.cost) / part.quantity).toFixed(2)}{" "}
                          each
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {record.notes && (
                <div className="mt-6 pt-4 border-t">
                  <h5 className="font-medium mb-2">Record Notes</h5>
                  <p className="text-gray-700">{record.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
