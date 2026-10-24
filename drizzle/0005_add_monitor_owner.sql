-- Existing monitors have no owner (they were demo seed data only), so they are removed.
DELETE FROM "monitors";--> statement-breakpoint
ALTER TABLE "monitors" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "monitors" ADD CONSTRAINT "monitors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "monitors_user_id_idx" ON "monitors" USING btree ("user_id");