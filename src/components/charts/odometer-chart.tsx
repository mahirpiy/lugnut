"use client";

import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { OdometerEntry } from "@/lib/interfaces/odometer-entry";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { TooltipProps } from "recharts";
import OdometerTile from "../odometer/odometer-tile";
import { Button } from "../ui/button";

interface VehicleChartProps {
  title?: string;
  description?: string;
  entries: OdometerEntry[];
}

interface DataPoint {
  monthLabel: string;
  miles: number;
  originalDate: string; // Keep original date for tooltip
  xPosition: number; // Position within the month for spacing
  readingType: "reading" | "fueling" | "initial" | "job";
}

const formatMiles = (value: number) => `${value.toLocaleString()}`;

const getMonthLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getFullYear().toString().slice(2)}`;
};

const roundToNearest100 = (value: number) => Math.floor(value / 100) * 100;

export function OdometerChart({
  title = "Odometer Trend",
  description = "Tracking vehicle mileage",
  entries,
}: VehicleChartProps) {
  const { data: session } = useSession();
  const { vehicleId } = useParams();
  const router = useRouter();
  const config = {
    odometer: {
      label: "Odometer",
      color: "var(--muted-foreground)",
    },
  } satisfies ChartConfig;

  // Calculate mileage trends based on time periods
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  );

  const trendData = getTrendData(sortedEntries);

  const minValue = Math.min(...entries.map((d) => d.odometer));
  const maxValue = Math.max(...entries.map((d) => d.odometer));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          {session?.user?.hasActiveSubscription && (
            <Button
              className="w-36 h-8 flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => {
                router.push(`/garage/vehicles/${vehicleId}/odometer/new`);
              }}
            >
              <Plus className="h-5 w-5" />
              Add Reading
            </Button>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <LineChart
            data={mapOdometerEntriesToDataPoints(entries)}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="xPosition"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value) => {
                // Find the data point that corresponds to this tick
                const dataPoints = mapOdometerEntriesToDataPoints(entries);
                const point = dataPoints.find(
                  (p) => Math.abs(p.xPosition - value) < 0.1
                );
                return point ? point.monthLabel : "";
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatMiles}
              domain={[
                roundToNearest100(minValue - 50),
                roundToNearest100(maxValue + 50),
              ]}
              interval={0}
            />
            <ChartTooltip
              cursor={true}
              content={(props: TooltipProps<number, string>) => {
                if (!props.active || !props.payload?.length) {
                  return null;
                }
                const data = props.payload[0].payload as DataPoint;
                return (
                  <OdometerTile
                    date={data.originalDate}
                    odometer={data.miles}
                    type={data.readingType}
                  />
                );
              }}
            />
            <Line
              dataKey="miles"
              type="natural"
              stroke="var(--muted-foreground)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {trendData.hasEnoughData ? (
          <div className="flex gap-2 leading-none font-medium items-center mb-2">
            {trendData.isAboveAverage ? (
              <>
                {Math.abs(Math.round(trendData.percentageDiff))}% higher mileage
                in recent period
                <TrendingUp className="h-4 w-4" />
              </>
            ) : (
              <>
                {Math.abs(Math.round(trendData.percentageDiff))}% lower mileage
                in recent period
                <TrendingDown className="h-4 w-4" />
              </>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground">
            Need more data points to show trends
          </div>
        )}
        {trendData.hasEnoughData && (
          <div className="text-xs text-muted-foreground">
            Recent 30 days:{" "}
            {Math.round(trendData.currentPeriodMiles).toLocaleString()} miles •
            Average 30-day period:{" "}
            {Math.round(trendData.averageMiles).toLocaleString()} miles
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

function mapOdometerEntriesToDataPoints(entries: OdometerEntry[]): DataPoint[] {
  // Group entries by month-year
  const monthlyEntries = new Map<string, OdometerEntry[]>();

  entries.forEach((entry) => {
    const monthKey = getMonthLabel(entry.entryDate);
    if (!monthlyEntries.has(monthKey)) {
      monthlyEntries.set(monthKey, []);
    }
    monthlyEntries.get(monthKey)!.push(entry);
  });

  // Convert to array and sort by date
  const sortedMonths = Array.from(monthlyEntries.entries()).sort(
    ([, entriesA], [, entriesB]) => {
      const dateA = new Date(entriesA[0].entryDate);
      const dateB = new Date(entriesB[0].entryDate);
      return dateA.getTime() - dateB.getTime();
    }
  );

  // Create data points with evenly spaced months but all individual entries
  const dataPoints: DataPoint[] = [];

  sortedMonths.forEach(([monthLabel, monthEntries], monthIndex) => {
    // Sort entries within the month by date
    const sortedEntries = monthEntries.sort(
      (a, b) =>
        new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    );

    // Space entries evenly within their month
    sortedEntries.forEach((entry, entryIndex) => {
      // Each month gets a base position, entries are spaced within ±0.3 of that position
      const basePosition = monthIndex;
      const entrySpacing =
        sortedEntries.length > 1
          ? (0.6 / (sortedEntries.length - 1)) * entryIndex - 0.3
          : 0;

      dataPoints.push({
        monthLabel:
          entryIndex === Math.floor(sortedEntries.length / 2) ? monthLabel : "", // Only show month label on middle entry
        miles: entry.odometer,
        originalDate: entry.entryDate,
        readingType: entry.type,
        xPosition: basePosition + entrySpacing,
      });
    });
  });

  return dataPoints;
}

function getTrendData(sortedEntries: OdometerEntry[]) {
  if (sortedEntries.length < 2) {
    // Not enough data for trend analysis
    return {
      hasEnoughData: false,
      percentageDiff: 0,
      isAboveAverage: false,
      currentPeriodMiles: 0,
      averageMiles: 0,
    };
  } else {
    // Get the most recent 30-day period
    const latestEntry = sortedEntries[sortedEntries.length - 1];
    const latestDate = new Date(latestEntry.entryDate);
    const thirtyDaysAgo = new Date(
      latestDate.getTime() - 30 * 24 * 60 * 60 * 1000
    );

    // Find entries in the last 30 days
    const recentEntries = sortedEntries.filter(
      (entry) => new Date(entry.entryDate) >= thirtyDaysAgo
    );

    // Calculate miles driven in the recent period
    const currentPeriodMiles =
      recentEntries.length >= 2
        ? recentEntries[recentEntries.length - 1].odometer -
          recentEntries[0].odometer
        : 0;

    // Calculate average daily miles across all data
    const totalDays =
      (new Date(latestEntry.entryDate).getTime() -
        new Date(sortedEntries[0].entryDate).getTime()) /
      (24 * 60 * 60 * 1000);
    const totalMiles = latestEntry.odometer - sortedEntries[0].odometer;
    const averageDailyMiles = totalDays > 0 ? totalMiles / totalDays : 0;
    const averageMiles = averageDailyMiles * 30; // 30-day equivalent

    // Calculate the percentage difference
    const percentageDiff =
      averageMiles > 0
        ? ((currentPeriodMiles - averageMiles) / averageMiles) * 100
        : 0;
    const isAboveAverage = percentageDiff > 0;

    return {
      hasEnoughData: true,
      percentageDiff,
      isAboveAverage,
      currentPeriodMiles,
      averageMiles,
    };
  }
}
