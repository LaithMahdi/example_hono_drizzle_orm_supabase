import { describeRoute } from "hono-openapi";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  createProductSchema,
  updateProductSchema,
} from "@/controller/products/schema";

// Convert Zod schemas to JSON schemas for OpenAPI documentation
const createProductRawSchema = zodToJsonSchema(createProductSchema, {
  name: "CreateProduct",
});
const createProductJsonSchema =
  createProductRawSchema.definitions?.CreateProduct || {};

const updateProductRawSchema = zodToJsonSchema(updateProductSchema, {
  name: "UpdateProduct",
});
const updateProductJsonSchema =
  updateProductRawSchema.definitions?.UpdateProduct || {};

// Define response schemas
const successResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    isActive: z.boolean(),
  }),
});

const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

const paginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
      price: z.number(),
      isActive: z.boolean(),
    })
  ),
  totalItems: z.number(),
  pageInfo: z.object({
    hasPreviousPage: z.boolean(),
    hasNextPage: z.boolean(),
  }),
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

const paginatedResponseJsonSchema =
  zodToJsonSchema(paginatedResponseSchema, {
    name: "PaginatedResponse",
  }).definitions?.PaginatedResponse || {};

// Get all products documentation
export const getAllProductsDocs = describeRoute({
  tags: ["Products"],
  summary: "Get all products",
  description:
    "Retrieve a paginated list of products with optional filtering by active status.",
  parameters: [
    {
      name: "page",
      in: "query",
      description: "Page number for pagination (default: 1)",
      required: false,
      schema: { type: "integer", default: 1 },
    },
    {
      name: "limit",
      in: "query",
      description: "Number of items per page (default: 10)",
      required: false,
      schema: { type: "<integer>", default: 10 },
    },
    {
      name: "isActive",
      in: "query",
      description: "Filter by active status (true/false)",
      required: false,
      schema: { type: "boolean" },
    },
  ],
  responses: {
    200: {
      description: "Successful response with paginated products",
      content: {
        "application/json": {
          schema: paginatedResponseJsonSchema,
        },
      },
    },
    404: {
      description: "No products found",
      content: {
        "application/json": {
          schema: errorResponseJsonSchema,
        },
      },
    },
  },
});

// Get product by ID documentation
export const getProductByIdDocs = describeRoute({
  tags: ["Products"],
  summary: "Get product by ID",
  description:
    "Retrieve detailed information about a specific product by its ID.",
  responses: {
    200: {
      description: "Product found",
      content: {
        "application/json": {
          schema: successResponseJsonSchema,
        },
      },
    },
    400: {
      description: "Invalid ID",
      content: {
        "application/json": {
          schema: errorResponseJsonSchema,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: errorResponseJsonSchema,
        },
      },
    },
  },
});

// Create product documentation
export const createProductDocs = describeRoute({
  tags: ["Products"],
  summary: "Create a new product",
  description: "Create a new product with the provided details.",
  requestBody: {
    content: {
      "application/json": {
        schema: createProductJsonSchema,
      },
    },
  },
  responses: {
    201: {
      description: "Product created successfully",
      content: {
        "application/json": {
          schema: successResponseJsonSchema,
        },
      },
    },
    400: {
      description: "Invalid request body",
      content: {
        "application/json": {
          schema: errorResponseJsonSchema,
        },
      },
    },
  },
});

// Update product documentation
export const updateProductDocs = describeRoute({
  tags: ["Products"],
  summary: "Update a product",
  description: "Update a product by its ID with the provided details.",
  requestBody: {
    content: {
      "application/json": {
        schema: updateProductJsonSchema,
      },
    },
  },
  responses: {
    200: {
      description: "Product updated successfully",
      content: {
        "application/json": {
          schema: successResponseJsonSchema,
        },
      },
    },
    400: {
      description: "Invalid ID or request body",
      content: {
        "application/json": {
          schema: errorResponseJsonSchema,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: errorResponseJsonSchema,
        },
      },
    },
  },
});

// Delete product documentation
export const deleteProductDocs = describeRoute({
  tags: ["Products"],
  summary: "Delete a product",
  description: "Delete a product by its ID.",
  responses: {
    200: {
      description: "Product deleted successfully",
      content: {
        "application/json": {
          schema: successResponseJsonSchema,
        },
      },
    },
    400: {
      description: "Invalid ID",
      content: {
        "application/json": {
          schema: errorResponseJsonSchema,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: errorResponseJsonSchema,
        },
      },
    },
  },
});
