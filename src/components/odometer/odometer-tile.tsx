import { OdometerEntry } from "@/lib/interfaces/odometer-entry";
import { Fuel, Gauge, Gift, Wrench } from "lucide-react";

interface OdometerEntryProps {
  entry: OdometerEntry;
}

export default function OdometerTile({ entry }: OdometerEntryProps) {
  return (
    <div
      key={`${entry.id}-${entry.odometer}`}
      className="flex items-center justify-between p-4 bg-muted-foreground rounded-lg"
    >
      <div className="flex items-center space-x-3">
        {getIcon(entry.type)}
        <div>
          <p className="font-medium text-background">
            {entry.odometer.toLocaleString()} miles
          </p>
          <p className="text-sm text-background">
            {new Date(entry.entryDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// TODO: make this an enum
function getIcon(type: string) {
  if (type === "reading") return <Gauge className="h-5 w-5 text-background" />;
  if (type === "fueling") return <Fuel className="h-5 w-5 text-background" />;
  if (type === "initial") return <Gift className="h-5 w-5 text-background" />;
  return <Wrench className="h-5 w-5 text-background" />;
}
