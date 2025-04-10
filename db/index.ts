import { drizzle } from "drizzle-orm/neon-serverless";
import pg from "pg";
import ws from "ws";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a PostgreSQL pool for connect-pg-simple session storage
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Use Neon serverless for the main database operations
export const db = drizzle({
  connection: process.env.DATABASE_URL,
  schema,
  ws: ws,
});
