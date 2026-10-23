CREATE TABLE "checks" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "checks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"monitor_id" uuid NOT NULL,
	"ok" boolean NOT NULL,
	"status_code" integer,
	"response_time_ms" integer NOT NULL,
	"error" text,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "checks_status_code_check" CHECK ("checks"."status_code" BETWEEN 100 AND 599),
	CONSTRAINT "checks_response_time_ms_check" CHECK ("checks"."response_time_ms" >= 0)
);
--> statement-breakpoint
ALTER TABLE "checks" ADD CONSTRAINT "checks_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "checks_monitor_id_checked_at_idx" ON "checks" USING btree ("monitor_id","checked_at");--> statement-breakpoint
ALTER TABLE "monitors" ADD CONSTRAINT "monitors_interval_seconds_check" CHECK ("monitors"."interval_seconds" BETWEEN 30 AND 3600);