CREATE TABLE IF NOT EXISTS "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "users";--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "customer_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "created_by" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "user_id";