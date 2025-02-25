import { env } from "@/dotenv_config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "pglite",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
