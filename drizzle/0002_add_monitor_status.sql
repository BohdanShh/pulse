CREATE TYPE "public"."monitor_status" AS ENUM('PENDING', 'UP', 'DOWN');--> statement-breakpoint
ALTER TABLE "monitors" ADD COLUMN "status" "monitor_status" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "monitors" ADD COLUMN "last_checked_at" timestamp with time zone;