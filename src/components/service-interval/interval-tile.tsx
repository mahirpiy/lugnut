import { ServiceInterval } from "@/lib/interfaces/service-interval";

interface ServiceIntervalProps {
  interval: ServiceInterval;
}

export default function ServiceIntervalTile({
  interval,
}: ServiceIntervalProps) {
  return (
    <div
      key={`${interval.id}`}
      className="flex items-center justify-between p-4 bg-muted-foreground rounded-lg"
    >
      <div className="flex items-center space-x-3">
        <div>
          <p className="font-medium text-background">
            Mileage Interval: {interval.mileageInterval?.toLocaleString()} miles
          </p>
          <p className="font-medium text-background">
            Month Interval: {interval.monthInterval?.toLocaleString()} months
          </p>
        </div>
      </div>
    </div>
  );
}
