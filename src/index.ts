import { serve } from "@hono/node-server";
import app from "@/app";
import { showRoutes } from "hono/dev";
import { seedProducts } from "@/seed/product_seed";

const init = async () => {
  await seedProducts();
  console.log("✅ Seeding completed.");
};

init();

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

showRoutes(app);
