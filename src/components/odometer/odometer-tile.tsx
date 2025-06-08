import { Fuel, Gauge, Gift, Wrench } from "lucide-react";

interface OdometerEntryProps {
  date: string;
  odometer: number;
  type: "reading" | "fueling" | "initial" | "job";
}

export default function OdometerTile({
  date,
  odometer,
  type,
}: OdometerEntryProps) {
  return (
    <div
      key={`${date}-${odometer}`}
      className="flex items-center justify-between p-4 bg-muted-foreground rounded-lg"
    >
      <div className="flex items-center space-x-3">
        {getIcon(type)}
        <div>
          <p className="font-medium text-background">
            {odometer.toLocaleString()} miles
          </p>
          <p className="text-sm text-background">
            {new Date(date).toLocaleDateString("en-US", {
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
