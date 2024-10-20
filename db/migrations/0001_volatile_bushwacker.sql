CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "user_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "billing_name";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "billing_email";