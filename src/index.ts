import { showRoutes } from "hono/dev";
import { serve } from "@hono/node-server";
import app from "@/app";
import { seedProducts } from "@/seed/product_seed";
import { env } from "@/dotenv_config";

const init = async () => {
  await seedProducts();
  console.log("✅ Seeding completed.");
};

init();

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

showRoutes(app);
