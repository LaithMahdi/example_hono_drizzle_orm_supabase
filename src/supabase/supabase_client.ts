import { env } from "@/dotenv_config";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
