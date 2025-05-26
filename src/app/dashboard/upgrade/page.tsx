"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function UpgradePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [jobQuantity, setJobQuantity] = useState<number>(0);
  const [fuelQuantity, setFuelQuantity] = useState<number>(0);
  const [vehicleQuantity, setVehicleQuantity] = useState<number>(0);
  const calculateTotal = () => {
    if (selectedPlan === "monthly") return 10;
    if (selectedPlan === "yearly") return 100;
    return vehicleQuantity * 5 + jobQuantity * 2.5 + fuelQuantity * 1;
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          Upgrade To Unlock All Features
        </h1>

        <p className="mb-4">
          By becoming a Lugnut Pro, you get access to a whole host of features:
        </p>

        <ul className="list-decimal pl-6 mb-6 space-y-2">
          <li>Fuel Tracking</li>
          <li>Odometer Tracking</li>
          <li>
            Unlimited photos per job, and the ability to upload part photos
          </li>
          <li>
            The ability to connect with other Luggers to share tips, advice, and
            help you work on your own car{" "}
            <Badge
              variant="outline"
              className="ml-2 bg-muted-foreground text-background"
            >
              <p className="text-background">Coming Soon</p>
            </Badge>
          </li>
          <li>
            Access to Luggy, your AI mechanic{" "}
            <Badge variant="outline" className="ml-2 bg-muted-foreground">
              <p className="text-background">Coming Soon</p>
            </Badge>
          </li>
        </ul>

        <Tabs defaultValue="payg" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payg">Pay-as-you-go</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="payg" className="mt-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Pay As You Go</h2>
              <p className="text-muted-foreground">
                Not sure if you want to subscribe? Get access to individual
                records on a pay-per basis:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="font-semibold">$5.00</span> per vehicle.
                  Includes 1 free job with unlimited records, parts and photos.
                </li>
                <li>
                  <span className="font-semibold">$2.50</span> per job.
                  Unlimited records, parts and photos
                </li>
                <li>
                  <span className="font-semibold">$1.00</span> per fuel record
                </li>
              </ul>
            </div>
            <Button
              className="w-full mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              Upgrade Now
            </Button>
          </TabsContent>

          <TabsContent value="subscription" className="mt-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Choose Your Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold">Monthly</h3>
                  <div className="text-2xl font-bold">$10/month</div>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold">Yearly</h3>
                  <div className="text-2xl font-bold">$100/year</div>
                  <div className="text-sm text-muted-foreground">
                    Save $20/year
                  </div>
                </Card>
              </div>
            </div>
            <Button
              className="w-full mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              Upgrade Now
            </Button>
          </TabsContent>
        </Tabs>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose Your Plan</DialogTitle>
            </DialogHeader>

            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="payg" id="payg" />
                  <Label htmlFor="payg">Pay-as-you-go</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">
                    Monthly Subscription - $10/month
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yearly" id="yearly" />
                  <Label htmlFor="yearly">
                    Yearly Subscription - $100/year
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {selectedPlan === "payg" && (
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicles">
                    Number of Vehicles ($5.00 each)
                  </Label>
                  <Input
                    id="vehicles"
                    type="number"
                    min="0"
                    value={vehicleQuantity}
                    onChange={(e) => setVehicleQuantity(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobs">Number of Jobs ($2.50 each)</Label>
                  <Input
                    id="jobs"
                    type="number"
                    min="0"
                    value={jobQuantity}
                    onChange={(e) => setJobQuantity(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuel">
                    Number of Fuel Records ($1.00 each)
                  </Label>
                  <Input
                    id="fuel"
                    type="number"
                    min="0"
                    value={fuelQuantity}
                    onChange={(e) => setFuelQuantity(Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            <div className="mt-4">
              <p className="text-lg font-bold text-right">
                Total: ${calculateTotal().toFixed(2)}
              </p>
              <Card className="p-4 mt-2 bg-muted">
                <p>
                  Email{" "}
                  <a
                    href="mailto:mahir@piyarali.io"
                    className="text-primary hover:underline"
                  >
                    mahir@piyarali.io
                  </a>{" "}
                  from the email of your lugnut account. Include the selected
                  plan you want and you&apos;ll receive payment instructions.
                </p>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
