CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"price" double precision,
	"isActive" boolean DEFAULT true
);
