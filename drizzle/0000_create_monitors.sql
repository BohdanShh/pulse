CREATE TYPE "public"."http_method" AS ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD');--> statement-breakpoint
CREATE TABLE "monitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"method" "http_method" DEFAULT 'GET' NOT NULL,
	"interval_seconds" integer DEFAULT 60 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
