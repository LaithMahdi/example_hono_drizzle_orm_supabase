import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import dotenv from "dotenv";
import { env } from "@/dotenv_config";

dotenv.config();

// Connect to Supabase database with SSL
const sql = postgres(env.DATABASE_URL, { ssl: { rejectUnauthorized: false } });
const db = drizzle(sql);

const main = async () => {
  try {
    console.log("Starting migration...");
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migration complete");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
};

main();
