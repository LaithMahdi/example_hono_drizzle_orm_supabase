import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().min(1, { message: "Email is required" }),
  password: z.string().min(8).min(1, { message: "Password is required" }),
});

export const registerSchema = z.object({
  email: z.string().email().min(1, { message: "Email is required" }),
  password: z.string().min(8).min(1, { message: "Password is required" }),
  phone: z.string().min(1, { message: "Phone is required" }),
});
