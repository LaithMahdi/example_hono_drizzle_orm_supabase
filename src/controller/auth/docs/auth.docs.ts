import { describeRoute } from "hono-openapi";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { loginSchema, registerSchema } from "@/controller/auth/schema";

// Convert Zod schemas to JSON schemas for OpenAPI documentation
const loginJsonSchema = zodToJsonSchema(loginSchema, { name: "Login" });
const createLoginJsonSchema = loginJsonSchema.definitions?.Login || {};

const registerJsonSchema = zodToJsonSchema(registerSchema, {
  name: "Register",
});
const createRegisterJsonSchema = registerJsonSchema.definitions?.Register || {};

// Define reusable response schemas
const successResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: z.object({
      id: z.string(),
      email: z.string(),
      phone: z.string().optional(),
    }),
    session: z
      .object({
        access_token: z.string(),
        refresh_token: z.string(),
      })
      .optional(),
  }),
});

const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

// Convert response schemas to JSON schemas
const successResponseJsonSchema =
  zodToJsonSchema(successResponseSchema, {
    name: "SuccessResponse",
  }).definitions?.SuccessResponse || {};

const errorResponseJsonSchema =
  zodToJsonSchema(errorResponseSchema, {
    name: "ErrorResponse",
  }).definitions?.ErrorResponse || {};

// Login documentation
export const loginDocs = describeRoute({
  tags: ["Authentication"],
  summary: "User Login",
  description: "Authenticate a user with email and password.",
  requestBody: {
    content: {
      "application/json": {
        schema: createLoginJsonSchema,
      },
    },
  },
  responses: {
    200: {
      description: "Successful login",
      content: {
        "application/json": {
          schema: successResponseJsonSchema,
        },
      },
    },
    404: {
      description: "User not found or invalid credentials",
      content: {
        "application/json": {
          schema: errorResponseJsonSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: errorResponseJsonSchema,
        },
      },
    },
  },
});

// Register documentation
export const registerDocs = describeRoute({
  tags: ["Authentication"],
  summary: "User Registration",
  description: "Register a new user with email, password, and phone number.",
  requestBody: {
    content: {
      "application/json": {
        schema: createRegisterJsonSchema,
      },
    },
  },
  responses: {
    200: {
      description: "Successful registration",
      content: {
        "application/json": {
          schema: successResponseJsonSchema,
        },
      },
    },
    404: {
      description: "Registration failed",
      content: {
        "application/json": {
          schema: errorResponseJsonSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: errorResponseJsonSchema,
        },
      },
    },
  },
});
