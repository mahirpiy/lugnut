"use client";

import CostBreakdown from "@/components/jobs/CostBreakdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVehicle } from "@/context/VehicleContext";
import {
  ArrowLeft,
  ClipboardList,
  DollarSign,
  Gauge,
  Package,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Part {
  id: string;
  name: string;
  partNumber?: string;
  manufacturer?: string;
  cost: string;
  quantity: number;
  url?: string;
  partPhotos?: { id: string; url: string }[];
}

interface Tag {
  id: string;
  name: string;
  isPreset: boolean;
}

interface Record {
  id: string;
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
  url?: string;
  difficulty: number;
  hours?: number;
  photos?: string[];
}

export default function JobDetailPage() {
  const { vehicleId, jobId } = useParams();
  const { vehicle, getVehicleDisplayName } = useVehicle();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch job details
        const jobResponse = await fetch(
          `/api/vehicles/${vehicleId}/jobs/${jobId}`
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
  }, [vehicleId, jobId]);

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

  if (!job || !vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>Job not found</p>
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
          <Wrench className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
            <p className="text-muted-foreground">
              {new Date(job.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Job Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClipboardList className="h-5 w-5" />
            <span>Job Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Gauge className="h-8 w-8 text-green-500 bg-green-100 rounded-lg p-2" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Odometer
                </p>
                <p className="font-semibold">
                  {job.odometer.toLocaleString()} miles
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Wrench className="h-8 w-8 text-purple-500 bg-purple-100 rounded-lg p-2" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Work Type
                </p>
                <p className="font-semibold">
                  {job.isDiy ? "DIY" : "Shop Work"}
                </p>
                {!job.isDiy && job.shopName && (
                  <p className="text-xs text-muted-foreground">
                    {job.shopName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-orange-500 bg-orange-100 rounded-lg p-2" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Cost
                </p>
                <p className="font-semibold text-lg">
                  ${job.totalCost.toFixed(2)}
                </p>
              </div>
            </div>

            {job.isDiy && (
              <div className="flex items-center space-x-3">
                <Wrench className="h-8 w-8 text-blue-500 bg-blue-100 rounded-lg p-2" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    DIY Difficulty
                  </p>
                  <p className="font-semibold">{job.difficulty}/10</p>
                </div>
              </div>
            )}
          </div>

          {job.notes && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-2">Job Notes</h4>
              <p className="text-muted-foreground">{job.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="records" className="w-full">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="records" className="flex-1">
            Records
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex-1">
            Costs
          </TabsTrigger>
          {job.photos && job.photos.length > 0 && (
            <TabsTrigger value="photos" className="flex-1">
              Photos ({job.photos.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="records" className="space-y-6">
          {job.records.map((record) => (
            <Card key={`record-${record.id}`} className="mb-8">
              <CardHeader className="bg-muted">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{record.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {record.tags.map((tag) => (
                        <Badge
                          key={`tag-${tag.id}`}
                          variant={tag.isPreset ? "default" : "secondary"}
                          className="bg-muted border-muted-foreground"
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
                    <p className="text-sm text-muted-foreground">
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
                      key={part.id}
                      className="flex items-center justify-between p-4 bg-muted-foreground rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Package className="h-5 w-5 text-background" />
                        <div>
                          <p className="font-medium text-background">
                            {part.name}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-background">
                            {part.manufacturer && (
                              <span>Brand: {part.manufacturer}</span>
                            )}
                            {part.partNumber && (
                              <span>PN: {part.partNumber}</span>
                            )}
                            <span>Qty: {part.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-background">
                          ${parseFloat(part.cost).toFixed(2)}
                        </p>
                        {part.quantity > 1 && (
                          <p className="text-sm text-background">
                            $
                            {(parseFloat(part.cost) / part.quantity).toFixed(2)}{" "}
                            each
                          </p>
                        )}
                      </div>
                      {part.partPhotos && part.partPhotos.length > 0 && (
                        <div className="flex gap-2">
                          {part.partPhotos.map((photo, index) => (
                            <div
                              key={photo.id}
                              className="w-[70px] h-[70px] relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                              onClick={() => window.open(photo.url, "_blank")}
                            >
                              <Image
                                src={photo.url}
                                alt={`Part Photo ${index + 1}`}
                                fill
                                sizes="70px"
                                className="object-cover hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {record.notes && (
                  <div className="mt-6 pt-4 border-t">
                    <h5 className="font-medium mb-2">Record Notes</h5>
                    <p className="text-muted-foreground">{record.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="costs">
          <CostBreakdown job={job} />
        </TabsContent>

        <TabsContent value="photos">
          {job.photos && job.photos.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {job.photos.map((photo, index) => (
                  <div
                    key={`job-photo-${index}`}
                    className="aspect-square relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => window.open(photo, "_blank")}
                  >
                    <Image
                      src={photo}
                      alt={`Job Photo ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No photos available</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
