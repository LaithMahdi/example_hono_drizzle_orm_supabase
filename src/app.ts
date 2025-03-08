import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { apiReference } from "@scalar/hono-api-reference";
import { openAPISpecs } from "hono-openapi";
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

app.get(
  "/openapi",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "API Documentation",
        version: "1.0.0",
        description:
          "This is a sample API documentation for the Hono framework. You can use this as a reference to create your own API documentation. Using the Hono framework, you can easily create API documentation with the help of the `hono-openapi` package.",
        contact: {
          name: "Team",
          email: "Mahdilaith380@gmail.com",
          url: "https://example.com",
        },
        licence: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
      },
      servers: [{ url: "http://localhost:3000/", description: "Local server" }],
    },
  })
);

app.get(
  "/docs",
  apiReference({
    theme: "bluePlanet",
    withDefaultFonts: true,
    spec: { url: "http://localhost:3000/api/v1/openapi" },
    baseServerURL: "http://localhost:3000/api/v1",
    darkMode: true,
  })
);

// Export the app TYPE
export type AppType = typeof app;

export default app;
