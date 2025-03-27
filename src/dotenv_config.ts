import "dotenv/config";
import { z } from "zod";

console.log("🔐 Loading environment variables...");

const serverSchema = z.object({
  // Node
  DATABASE_URL: z.string().min(1),
  NEXT_FRONT_URL: z.string().min(1),

  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_URL: z.string().min(1),
  // PORT
  PORT: z.coerce.number().default(3000),
});

const _serverEnv = serverSchema.safeParse(process.env);

if (!_serverEnv.success) {
  console.error("❌ Invalid environment variables:\n");
  _serverEnv.error.issues.forEach((issue) => {
    console.error(issue);
  });
  throw new Error("Invalid environment variables");
}

const { DATABASE_URL, NEXT_FRONT_URL, SUPABASE_ANON_KEY, SUPABASE_URL, PORT } =
  _serverEnv.data;

export const env = {
  DATABASE_URL,
  NEXT_FRONT_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  PORT,
};
console.log("✅ Environment variables loaded");
