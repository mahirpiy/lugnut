import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { calculateDiyLaborSavedString } from "@/utils/vehicleInsights";
import { Receipt } from "lucide-react";

interface CostBreakdownProps {
  job: {
    totalPartsCost: number;
    laborCost: string;
    isDiy: boolean;
    hours?: number;
    totalCost: number;
  };
}

export default function CostBreakdown({ job }: CostBreakdownProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Receipt className="h-5 w-5" />
          <span>Cost Breakdown</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Parts Cost</span>
            <span className="font-semibold">
              ${job.totalPartsCost.toFixed(2)}
            </span>
          </div>
          {job.isDiy && job.hours && job.hours > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">DIY Labor Saved</span>
              <span className="font-semibold text-green-600">
                {calculateDiyLaborSavedString(job.hours, false)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Labor Cost</span>
            <span className="font-semibold">
              ${parseFloat(job.laborCost).toFixed(2)}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-red-600">
              ${job.totalCost.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
