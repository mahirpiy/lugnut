import { db } from "./index";
import { tags } from "./schema";

const presetTags = [
  "Engine",
  "Transmission",
  "Suspension",
  "Electrical",
  "Brakes",
  "Fluids",
  "Exterior",
  "Interior",
  "Wheels/Tires",
];

export async function seedPresetTags() {
  for (const tagName of presetTags) {
    await db
      .insert(tags)
      .values({
        name: tagName,
        isPreset: true,
        userId: null, // Preset tags don't belong to a user
      })
      .onConflictDoNothing();
  }

  console.log("Preset tags seeded successfully");
}
