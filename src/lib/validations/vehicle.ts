import { z } from "zod";

const currentYear = new Date().getFullYear();

export const vehicleSchema = z
  .object({
    make: z
      .string()
      .min(1, "Make is required")
      .max(50, "Make must be less than 50 characters"),
    model: z
      .string()
      .min(1, "Model is required")
      .max(50, "Model must be less than 50 characters"),
    year: z
      .number()
      .min(1900, "Year must be 1900 or later")
      .max(currentYear + 1, `Year cannot be later than ${currentYear + 1}`),
    vin: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true; // Optional field
        return val.length === 17; // Basic VIN validation
      }, "VIN must be 17 characters"),
    licensePlate: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true; // Optional field
        return val.length <= 17 && val.length >= 1; // Basic license plate validation
      }, "License plate must be less than 17 characters"),
    nickname: z
      .string()
      .max(30, "Nickname must be less than 30 characters")
      .optional(),
    initialOdometer: z
      .number()
      .min(0, "Initial odometer must be positive")
      .max(10000000, "Initial odometer seems too high"),
    currentOdometer: z
      .number()
      .min(0, "Current odometer must be positive")
      .max(10000000, "Current odometer seems too high"),
    purchaseDate: z.date().refine((date) => {
      if (!date) return true;
      return date <= new Date();
    }, "Purchase date cannot be in the future"),
  })
  .refine((data) => data.currentOdometer >= data.initialOdometer, {
    message:
      "Current odometer must be greater than or equal to initial odometer",
    path: ["currentOdometer"],
  });

export type VehicleInput = z.infer<typeof vehicleSchema>;
