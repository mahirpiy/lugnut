// src/lib/validations/job.ts
import { z } from "zod";

export const partSchema = z.object({
  name: z
    .string()
    .min(2, "Part name must be at least 2 characters")
    .max(100, "Part name must be less than 100 characters"),
  partNumber: z
    .string()
    .max(50, "Part number must be less than 50 characters")
    .optional(),
  manufacturer: z
    .string()
    .max(50, "Manufacturer must be less than 50 characters")
    .optional(),
  cost: z.number().min(0, "Cost cannot be negative").optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export const recordSchema = z.object({
  title: z
    .string()
    .min(5, "Record title must be at least 5 characters")
    .max(100, "Record title must be less than 100 characters"),
  tagIds: z
    .array(z.number())
    .min(1, "At least one tag is required")
    .max(5, "Maximum 5 tags allowed"),
  parts: z.array(partSchema).min(1, "At least one part is required"),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
});

export const jobSchema = z
  .object({
    title: z
      .string()
      .min(5, "Job title must be at least 5 characters")
      .max(100, "Job title must be less than 100 characters"),
    date: z.date(),
    odometer: z
      .number()
      .int()
      .min(0, "Odometer must be positive")
      .max(10000000, "Odometer seems too high"),
    laborCost: z.number().min(0, "Labor cost cannot be negative").optional(),
    hours: z.number().min(0, "Hours cannot be negative").optional(),
    isDiy: z.boolean(),
    shopName: z
      .string()
      .max(100, "Shop name must be less than 100 characters")
      .optional(),
    difficulty: z.number().min(1).max(10).optional(),
    notes: z
      .string()
      .max(2000, "Notes must be less than 2000 characters")
      .optional(),
    records: z.array(recordSchema).min(0),
    url: z
      .string()
      .url("Please enter a valid URL")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      // If not DIY, shop name is required
      if (
        !data.isDiy &&
        (!data.shopName || data.shopName.trim().length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Shop name is required when work is not DIY",
      path: ["shopName"],
    }
  );

export type PartInput = z.infer<typeof partSchema>;
export type RecordInput = z.infer<typeof recordSchema>;
export type JobInput = z.infer<typeof jobSchema>;
