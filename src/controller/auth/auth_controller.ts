import { supabase } from "@/supabase/supabase_client";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { loginSchema, registerSchema } from "./schema";

const app = new Hono();

app
  .post("/login", zValidator("json", loginSchema), async (c) => {
    try {
      const { email, password } = await c.req.valid("json");

      const { data: user, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return c.json({ error: error.message }, 404);
      }

      return c.json({ user }, 200);
    } catch (error) {
      console.error("Login error:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  })
  .post("register", zValidator("json", registerSchema), async (c) => {
    try {
      const { email, password, phone } = await c.req.valid("json");

      const { data: user, error } = await supabase.auth.signUp({
        email,
        password,
        phone,
      });

      if (error) {
        return c.json({ error: error.message }, 404);
      }

      return c.json({ user }, 200);
    } catch (error) {
      console.error("Register error:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  });

export default app;
