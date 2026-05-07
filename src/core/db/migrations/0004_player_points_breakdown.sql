ALTER TABLE "match_stats" ADD COLUMN "base_points" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "match_stats" ADD COLUMN "breakdown" jsonb;