import { db } from "@/db";
import { products } from "@/db/schema";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { describeRoute } from "hono-openapi";
import { desc, eq, sql } from "drizzle-orm";
import {
  createProductSchema,
  updateProductSchema,
  paginationSchema,
} from "./schema";

import { zodToJsonSchema } from "zod-to-json-schema";

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

const app = new Hono()
  .get(
    "/all",
    describeRoute({
      summary: "Get all products",
      tags: ["Products"],
      description: "Get all products with pagination and filtering",
      responses: {
        200: { description: "Successful response" },
        404: { description: "Product not found" },
      },
      parameters: [
        {
          in: "query",
          name: "page",
          schema: {
            type: "string",
            description: "Page number",
          },
        },
        {
          in: "query",
          name: "limit",
          schema: {
            type: "string",
            description: "Number of items per page",
          },
        },
        {
          in: "query",
          name: "isActive",
          schema: {
            type: "string",
            description: "Filter by active status",
          },
        },
      ],
    }),
    zValidator("query", paginationSchema),
    async (c) => {
      const { page: pageStr, limit: limitStr, isActive } = c.req.valid("query");
      const page = Number(pageStr);
      const limit = Number(limitStr);
      const offset = (page - 1) * limit;

      const query = db
        .select()
        .from(products)
        .where(
          isActive !== undefined ? eq(products.isActive, isActive) : undefined
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(products.id));

      const allProducts = await query.execute();

      const totalCountQuery = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(
          isActive !== undefined ? eq(products.isActive, isActive) : undefined
        )
        .execute();
      const totalItems = totalCountQuery[0].count;

      return c.json({
        data: allProducts,
        totalItems,
        pageInfo: {
          hasPreviousPage: page > 1,
          hasNextPage: page * limit < totalItems,
        },
      });
    }
  )
  .get(
    "/:id",
    describeRoute({
      summary: "Get a product by ID",
      tags: ["Products"],
      description: "Get a product by its ID",
      responses: {
        200: { description: "Successful response" },
        400: { description: "Invalid ID" },
        404: { description: "Product not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.param();
      const newID = Number(id);
      if (isNaN(newID)) {
        return c.json({ error: "Invalid ID" }, 400);
      }
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, newID))
        .execute();
      if (!product[0]) {
        return c.json({ error: "Product not found" }, 404);
      }
      return c.json(product[0]);
    }
  )
  .post(
    "/create",
    describeRoute({
      summary: "Create a new product",
      tags: ["Products"],
      description:
        "Create a new product with the given details and return the created product details in the response body.",
      requestBody: {
        content: {
          "application/json": {
            schema: createProductJsonSchema,
          },
        },
      },
      responses: {
        201: { description: "Successful response" },
        400: { description: "Invalid request body" },
      },
    }),
    zValidator("json", createProductSchema),
    async (c) => {
      const { name, isActive, price, description } = c.req.valid("json");
      const newProduct = await db
        .insert(products)
        .values({
          name,
          isActive,
          price: parseFloat(price),
          description,
        })
        .returning();
      return c.json(
        {
          success: true,
          data: newProduct[0],
        },
        201
      );
    }
  )
  .put(
    "/update/:id",
    describeRoute({
      summary: "Update a product",
      tags: ["Products"],
      description: "Update a product by its ID with the provided details.",
      requestBody: {
        content: {
          "application/json": {
            schema: updateProductJsonSchema,
          },
        },
      },
      responses: {
        200: { description: "Product updated successfully" },
        400: { description: "Invalid ID or request body" },
        404: { description: "Product not found" },
      },
    }),
    zValidator("json", updateProductSchema),
    async (c) => {
      const { id } = c.req.param();
      const newID = Number(id);
      if (isNaN(newID)) {
        return c.json({ error: "Invalid ID" }, 400);
      }
      const { name, description, price, isActive } = c.req.valid("json");
      const updatedProduct = await db
        .update(products)
        .set({
          name,
          description,
          price: parseFloat(price!),
          isActive,
        })
        .where(eq(products.id, newID))
        .returning();
      if (!updatedProduct[0]) {
        return c.json({ error: "Product not found" }, 404);
      }
      return c.json(
        {
          success: true,
          data: updatedProduct[0],
        },
        200
      );
    }
  )
  .delete(
    "/delete/:id",
    describeRoute({
      summary: "Delete a product",
      tags: ["Products"],
      description: "Delete a product by its ID",
      responses: {
        200: { description: "Product deleted successfully" },
        400: { description: "Invalid ID" },
        404: { description: "Product not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.param();
      const newID = Number(id);
      if (isNaN(newID)) {
        return c.json({ error: "Invalid ID" }, 400);
      }
      const deletedProduct = await db
        .delete(products)
        .where(eq(products.id, newID))
        .returning();
      if (!deletedProduct[0]) {
        return c.json({ error: "Product not found" }, 404);
      }
      return c.json({ message: "Product deleted successfully" }, 200);
    }
  );

export default app;
