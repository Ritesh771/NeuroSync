import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./utils/schema.js",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./neurosync.db",
  },
});
