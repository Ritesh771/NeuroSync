import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Ensure we only initialize the Postgres driver on the server where env secrets are available.
// Calling `postgres()` in the browser causes runtime errors.
let dbInstance = null;

if (typeof window === "undefined") {
	const client = postgres(process.env.DRIZZLE_DB_URL || process.env.NEXT_PUBLIC_DRIZZLE_DB_URL);
	dbInstance = drizzle(client, { schema });
}

export const db = dbInstance;
