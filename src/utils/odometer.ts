import { db } from "@/lib/db";
import { odometerEntries, vehicles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function updateOdometer(
  vehicleId: number,
  oldOdometer: number,
  newOdometer: number,
  type: "reading" | "fueling" | "job",
  date: Date
): Promise<number | Error> {
  try {
    const odometerId = await db.transaction(async (tx) => {
      const [odometerRecord] = await tx
        .insert(odometerEntries)
        .values({
          vehicleId: vehicleId,
          odometer: newOdometer,
          type: type,
          entryDate: date,
        })
        .returning();

      // if the odometer is less than the old odometer, return
      if (newOdometer < oldOdometer) {
        return odometerRecord.id;
      }

      await tx
        .update(vehicles)
        .set({ currentOdometer: newOdometer, updatedAt: new Date() })
        .where(eq(vehicles.id, vehicleId));

      return odometerRecord.id;
    });

    return odometerId;
  } catch (error) {
    console.error("Error updating odometer:", error);
    return error as Error;
  }
}
