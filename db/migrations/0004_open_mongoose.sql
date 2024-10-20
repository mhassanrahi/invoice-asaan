ALTER TABLE "customers" ADD COLUMN "organization_id" varchar(255);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "organization_id" varchar(255);