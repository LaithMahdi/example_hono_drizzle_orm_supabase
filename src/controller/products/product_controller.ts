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

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Build the query with filtering
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

      // Get total count for pagination metadata
      const totalCountQuery = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(
          isActive !== undefined ? eq(products.isActive, isActive) : undefined
        )
        .execute();

      const totalItems = totalCountQuery[0].count;

      // Calculate pagination metadata
      const hasPreviousPage = page > 1;
      const hasNextPage = page * limit < totalItems;

      return c.json({
        data: allProducts,
        totalItems,
        pageInfo: {
          hasPreviousPage,
          hasNextPage,
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

      // Convert the ID to a number and validate it
      const newID = Number(id);

      // Check if the ID is a valid number and is a positive integer
      if (isNaN(newID)) {
        return c.json({ error: "Invalid ID" }, 400);
      }

      // Fetch the product from the database
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, newID))
        .execute();

      // Check if the product was found
      if (!product[0]) {
        return c.json({ error: "Product not found" }, 404);
      }

      // Return the product
      return c.json(product[0]);
    }
  )
  .post("/create", zValidator("json", createProductSchema), async (c) => {
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
  })
  .put("/update/:id", zValidator("json", updateProductSchema), async (c) => {
    const { id } = c.req.param();

    // Convert the ID to a number
    const newID = Number(id);

    const { name, description, price, isActive } = c.req.valid("json");

    if (isNaN(newID)) {
      return c.json({ error: "Invalid ID" }, 400);
    }

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
  })
  .delete("/delete/:id", async (c) => {
    const { id } = c.req.param();

    // Convert the ID to a number
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
  });

export default app;
