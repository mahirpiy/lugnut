/*
    Supabase quirks: 
    - Migrations use session pooling (5432)
    - App uses transaction pooling (6543)
    - We have to swap the port for migrations
*/

export function getDbUrl() {
  const isMigration = process.argv.some(
    (arg) =>
      arg.includes("push") ||
      arg.includes("migrate") ||
      arg.includes("generate")
  );

  const dbUrl = isMigration
    ? process.env.DATABASE_URL!.replace(":6543", ":5432") // session pooling for migrations
    : process.env.DATABASE_URL!; // transaction pooling for app

  if (process.env.NODE_ENV === "development") {
    console.log(
      `Port: ${
        dbUrl.includes(":5432")
          ? "5432 (session pooling)"
          : "6543 (transaction pooling)"
      }`
    );
  }

  return isMigration
    ? process.env.DATABASE_URL!.replace(":6543", ":5432")
    : process.env.DATABASE_URL!;
}
