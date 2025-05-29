import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDbUrl } from "./db-connection";

const client = postgres(getDbUrl());

export const db = drizzle({ client });
