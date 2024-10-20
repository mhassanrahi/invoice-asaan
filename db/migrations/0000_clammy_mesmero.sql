DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('pending', 'paid');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"billing_name" varchar NOT NULL,
	"billing_email" varchar NOT NULL,
	"value" integer NOT NULL,
	"description" text NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
