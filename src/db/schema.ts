import {
  pgTable,
  serial,
  text,
  doublePrecision,
  boolean,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  price: doublePrecision(),
  isActive: boolean("isActive").default(true),
});
