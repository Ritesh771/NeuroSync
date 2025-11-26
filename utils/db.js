import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";

// Ensure we only initialize the SQLite database on the server
let dbInstance = null;

if (typeof window === "undefined") {
	// Create database file in project root
	const dbPath = path.join(process.cwd(), "neurosync.db");
	const sqlite = new Database(dbPath);
	dbInstance = drizzle(sqlite, { schema });
	console.log("SQLite database initialized at:", dbPath);
}

export const db = dbInstance;
