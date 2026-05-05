CREATE TYPE "public"."roster_cycle_status" AS ENUM('draft', 'published');--> statement-breakpoint
ALTER TABLE "roster_cycles" ADD COLUMN "status" "roster_cycle_status" DEFAULT 'draft' NOT NULL;