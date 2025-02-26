import { z } from "zod";

// Schema for creating a product
export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Price must be a number",
  }),
  isActive: z.boolean().optional().default(true),
});

// Schema for updating a product
export const updateProductSchema = createProductSchema.partial();

// Schema for pagination and filtering
export const paginationSchema = z.object({
  page: z
    .string()
    .default("1")
    .refine((val) => !isNaN(Number(val)), {
      message: "Page must be a number",
    }),
  limit: z
    .string()
    .default("10")
    .refine((val) => !isNaN(Number(val)), {
      message: "Limit must be a number",
    }),
  isActive: z
    .string()
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined
    ),
});
