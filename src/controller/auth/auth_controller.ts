import { supabase } from "@/supabase/supabase_client";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { loginSchema, registerSchema } from "@/controller/auth/schema";
import { loginDocs, registerDocs } from "@/controller/auth/docs/auth.docs";

const app = new Hono()
  .post("/login", loginDocs, zValidator("json", loginSchema), async (c) => {
    try {
      const { email, password } = await c.req.valid("json");

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return c.json({ error: error.message }, 404);
      }

      // Ensure the response matches the schema
      return c.json(
        {
          user: {
            id: data.user?.id,
            email: data.user?.email,
            phone: data.user?.phone,
          },
          session: {
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
          },
        },
        200
      );
    } catch (error) {
      console.error("Login error:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  })
  .post(
    "/register",
    registerDocs,
    zValidator("json", registerSchema),
    async (c) => {
      try {
        const { email, password, phone } = await c.req.valid("json");

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          phone,
        });

        if (error) {
          return c.json({ error: error.message }, 404);
        }

        // Ensure the response matches the schema
        return c.json(
          {
            user: {
              id: data.user?.id,
              email: data.user?.email,
              phone: data.user?.phone,
            },
            session: {
              access_token: data.session?.access_token,
              refresh_token: data.session?.refresh_token,
            },
          },
          200
        );
      } catch (error) {
        console.error("Register error:", error);
        return c.json({ error: "Internal Server Error" }, 500);
      }
    }
  );

export default app;
