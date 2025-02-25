import { db } from "@/db";
import { products } from "@/db/schema";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, sql } from "drizzle-orm";
import {
  createProductSchema,
  updateProductSchema,
  paginationSchema,
} from "./schema";

const app = new Hono();

// Get all products with pagination and filtering
app.get("/all", zValidator("query", paginationSchema), async (c) => {
  const { page: pageStr, limit: limitStr, isActive } = c.req.valid("query");
  const page = Number(pageStr);
  const limit = Number(limitStr);

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Build the query with filtering
  const query = db
    .select()
    .from(products)
    .where(isActive !== undefined ? eq(products.isActive, isActive) : undefined)
    .limit(limit)
    .offset(offset);

  const allProducts = await query.execute();

  // Get total count for pagination metadata
  const totalCountQuery = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(isActive !== undefined ? eq(products.isActive, isActive) : undefined)
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
});

// Get a single product by ID
app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .execute();

  if (!product[0]) {
    return c.json({ error: "Product not found" }, 404);
  }

  return c.json(product[0]);
});

// Create a new product
app.post("/", zValidator("json", createProductSchema), async (c) => {
  const productData = c.req.valid("json");

  const newProduct = await db.insert(products).values(productData).returning();

  return c.json(newProduct[0], 201);
});

// Update a product by ID
app.put("/:id", zValidator("json", updateProductSchema), async (c) => {
  const id = Number(c.req.param("id"));
  const productData = c.req.valid("json");

  if (isNaN(id)) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const updatedProduct = await db
    .update(products)
    .set(productData)
    .where(eq(products.id, id))
    .returning();

  if (!updatedProduct[0]) {
    return c.json({ error: "Product not found" }, 404);
  }

  return c.json(updatedProduct[0]);
});

// Delete a product by ID
app.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const deletedProduct = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();

  if (!deletedProduct[0]) {
    return c.json({ error: "Product not found" }, 404);
  }

  return c.json({ message: "Product deleted successfully" });
});

export default app;
