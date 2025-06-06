import dotenv from "dotenv";

// Load environment variables first
dotenv.config({ path: ".env.local" });

// Debug environment variables
console.log("Environment check:");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "✓" : "✗");
console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗"
);
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✓" : "✗");
console.log("BUCKET_NAME:", process.env.BUCKET_NAME ? "✓" : "✗");

async function main() {
  console.log("\nStarting backfill process...");

  // Import and run the migration
  const { migratePhotos } = await import("./migrate-supabase-storage");
  await migratePhotos();
}

main()
  .catch(console.error)
  .finally(() => {
    console.log("\nBackfill process completed.");
    process.exit(0);
  });
