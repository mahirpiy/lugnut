import { ServiceInterval } from "@/lib/interfaces/service-interval";
import { Package } from "lucide-react";

interface ServiceIntervalProps {
  intervals: ServiceInterval[];
}

export default function ServiceIntervals({ intervals }: ServiceIntervalProps) {
  return (
    <div className="space-y-4">
      {intervals.map((interval) => (
        <div
          key={interval.id}
          className="flex items-center justify-between p-4 bg-muted-foreground rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <Package className="h-5 w-5 text-background" />
            <div>
              <p className="font-medium text-background">{interval.name}</p>
              <div className="flex items-center space-x-4 text-sm text-background">
                {/* {part.manufacturer && <span>Brand: {part.manufacturer}</span>}
                {part.partNumber && <span>PN: {part.partNumber}</span>}
                <span>Qty: {part.quantity}</span> */}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
