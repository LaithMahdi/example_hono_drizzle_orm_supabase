import { db } from "@/db";
import { products } from "@/db/schema";
import { count } from "drizzle-orm";
import { faker } from "@faker-js/faker";

export async function seedProducts() {
  try {
    // Check if products already exist in the database
    const productCount = await db
      .select({ count: count() })
      .from(products)
      .execute();

    if (productCount[0].count > 0) {
      console.log("⚠️ Products already seeded. Skipping...");
      return;
    }

    const data = await Promise.all(
      Array.from({ length: 100 }).map(async (_, i) => {
        return {
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: parseFloat(faker.commerce.price()),
          isActive: i % 2 === 0 ? true : false,
        };
      })
    );

    // Insert sample products into the database
    await db.insert(products).values(data).execute();

    console.log("✅ Products seeded successfully!");
  } catch (error) {
    console.error("Error seeding products:", error);
    throw new Error("❌ Failed to seed products");
  }
}
