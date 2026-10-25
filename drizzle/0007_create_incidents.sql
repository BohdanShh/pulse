CREATE TABLE "incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"monitor_id" uuid NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"cause" text
);
--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "incidents_monitor_id_started_at_idx" ON "incidents" USING btree ("monitor_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "incidents_one_open_per_monitor_idx" ON "incidents" USING btree ("monitor_id") WHERE "incidents"."ended_at" IS NULL;