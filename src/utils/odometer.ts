import { db } from "@/lib/db";
import { vehicles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function updateOdometer(
  vehicleUuid: string,
  newOdometer: number
): Promise<Error | null> {
  try {
    await db
      .update(vehicles)
      .set({ currentOdometer: newOdometer, updatedAt: new Date() })
      .where(eq(vehicles.uuid, vehicleUuid));
    return null;
  } catch (error) {
    console.error("Error updating odometer:", error);
    return error as Error;
  }
}
