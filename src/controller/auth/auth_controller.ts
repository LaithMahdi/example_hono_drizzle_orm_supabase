import { supabase } from "@/supabase/supabase_client";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { loginSchema, registerSchema } from "./schema";
import { describeRoute } from "hono-openapi";
import { zodToJsonSchema } from "zod-to-json-schema";

const loginJsonSchema = zodToJsonSchema(loginSchema, { name: "Login" });
const createLoginJsonSchema = loginJsonSchema.definitions?.Login || {};

const registerJsonSchema = zodToJsonSchema(registerSchema, {
  name: "Register",
});
const createRegisterJsonSchema = registerJsonSchema.definitions?.Register || {};

const app = new Hono();

app.post(
  "/login",
  describeRoute({
    summary: "User Login",
    tags: ["Authentication"],
    description: "Authenticate a user with email and password",
    requestBody: {
      content: {
        "application/json": {
          schema: createLoginJsonSchema,
        },
      },
    },
    responses: {
      200: { description: "Successful login" },
      404: { description: "User not found or invalid credentials" },
      500: { description: "Internal Server Error" },
    },
  }),
  zValidator("json", loginSchema),
  async (c) => {
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
  }
);

app.post(
  "/register",
  describeRoute({
    summary: "User Registration",
    tags: ["Authentication"],
    description: "Register a new user with email, password, and phone number",
    requestBody: {
      content: {
        "application/json": {
          schema: createRegisterJsonSchema,
        },
      },
    },
    responses: {
      200: { description: "Successful registration" },
      404: { description: "Registration failed" },
      500: { description: "Internal Server Error" },
    },
  }),
  zValidator("json", registerSchema),
  async (c) => {
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
  }
);

export default app;
