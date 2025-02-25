import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import { env } from "@/dotenv_config";
import authRoutes from "@/controller/auth/auth_controller";
import productRoutes from "@/controller/products/product_controller";

const app = new Hono()
  .basePath("/api/v1")
  // Middlewares
  .use(
    "*",
    cors({
      origin: env.NEXT_FRONT_URL,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
      maxAge: 600,
    })
  )
  // .use(
  //   "*",
  //   csrf({
  //     origin: "*",
  //   })
  // )
  .use("*", prettyJSON())
  .use("*", secureHeaders())
  .use("*", timing())
  // Routes
  .route("/auth", authRoutes)
  .route("/product", productRoutes);

// Export the app TYPE
export type AppType = typeof app;

export default app;
