import { db } from "@/db";
import { products } from "@/db/schema";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { desc, eq, sql } from "drizzle-orm";
import {
  createProductSchema,
  paginationSchema,
  updateProductSchema,
} from "@/controller/products/schema";
import {
  getAllProductsDocs,
  getProductByIdDocs,
  createProductDocs,
  updateProductDocs,
  deleteProductDocs,
} from "@/controller/products/docs/product.docs";

const app = new Hono()
  .get(
    "/all",
    getAllProductsDocs,
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
  .get("/:id", getProductByIdDocs, async (c) => {
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
  })
  .post(
    "/create",
    createProductDocs,
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
    updateProductDocs,
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
  .delete("/delete/:id", deleteProductDocs, async (c) => {
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
  });

export default app;
