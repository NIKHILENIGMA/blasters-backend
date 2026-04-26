CREATE TYPE "public"."booster_scope" AS ENUM('global', 'cycle', 'fixture');--> statement-breakpoint
CREATE TYPE "public"."fixture_lineup_status" AS ENUM('draft', 'locked', 'scored');--> statement-breakpoint
CREATE TYPE "public"."lineup_selection_type" AS ENUM('PLAYING', 'SUBSTITUTE');--> statement-breakpoint
CREATE TYPE "public"."ruleset_scope" AS ENUM('global', 'cycle', 'fixture');--> statement-breakpoint
CREATE TABLE "boosters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"scope" "booster_scope" DEFAULT 'fixture' NOT NULL,
	"config" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fixture_booster_awards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fixture_id" text NOT NULL,
	"booster_id" uuid NOT NULL,
	"roster_cycle_id" uuid NOT NULL,
	"player_id" uuid,
	"points_awarded" real NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fantasy_franchises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"team_name" text NOT NULL,
	"team_logo" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fixture_lineup_players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fixture_lineup_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"selection_type" "lineup_selection_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fixture_lineups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roster_cycle_id" uuid NOT NULL,
	"fixture_id" text NOT NULL,
	"ruleset_id" uuid,
	"status" "fixture_lineup_status" DEFAULT 'draft' NOT NULL,
	"captain_id" uuid NOT NULL,
	"vice_captain_id" uuid NOT NULL,
	"impact_player_id" uuid NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"locked_at" timestamp,
	"lineup_lock_at" timestamp,
	"auto_applied_from_lineup_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fixture_user_player_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fixture_user_points_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"selection_type" "lineup_selection_type" NOT NULL,
	"is_captain" boolean DEFAULT false NOT NULL,
	"is_vice_captain" boolean DEFAULT false NOT NULL,
	"is_impact_player" boolean DEFAULT false NOT NULL,
	"base_points" real DEFAULT 0 NOT NULL,
	"multiplier" real DEFAULT 1 NOT NULL,
	"bonus_points" real DEFAULT 0 NOT NULL,
	"final_points" real DEFAULT 0 NOT NULL,
	"breakdown" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fixture_user_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roster_cycle_id" uuid NOT NULL,
	"fixture_id" text NOT NULL,
	"lineup_id" uuid NOT NULL,
	"total_points" real DEFAULT 0 NOT NULL,
	"rank_snapshot" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roster_cycle_players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roster_cycle_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"purchase_price" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roster_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"franchise_id" uuid NOT NULL,
	"match_id" uuid NOT NULL,
	"budget_total" real DEFAULT 2000 NOT NULL,
	"budget_used" real DEFAULT 0 NOT NULL,
	"wallet_reset_amount" real DEFAULT 2000 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rulesets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"scope" "ruleset_scope" DEFAULT 'global' NOT NULL,
	"config" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fixtures" ADD COLUMN "lineup_lock_at" timestamp;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "buy_window_open_at" timestamp;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "buy_window_close_at" timestamp;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "squad_lock_at" timestamp;--> statement-breakpoint
ALTER TABLE "fixture_booster_awards" ADD CONSTRAINT "fixture_booster_awards_fixture_id_fixtures_id_fk" FOREIGN KEY ("fixture_id") REFERENCES "public"."fixtures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_booster_awards" ADD CONSTRAINT "fixture_booster_awards_booster_id_boosters_id_fk" FOREIGN KEY ("booster_id") REFERENCES "public"."boosters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_booster_awards" ADD CONSTRAINT "fixture_booster_awards_roster_cycle_id_roster_cycles_id_fk" FOREIGN KEY ("roster_cycle_id") REFERENCES "public"."roster_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_booster_awards" ADD CONSTRAINT "fixture_booster_awards_player_id_ipl_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."ipl_players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_franchises" ADD CONSTRAINT "fantasy_franchises_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_lineup_players" ADD CONSTRAINT "fixture_lineup_players_fixture_lineup_id_fixture_lineups_id_fk" FOREIGN KEY ("fixture_lineup_id") REFERENCES "public"."fixture_lineups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_lineup_players" ADD CONSTRAINT "fixture_lineup_players_player_id_ipl_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."ipl_players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_lineups" ADD CONSTRAINT "fixture_lineups_roster_cycle_id_roster_cycles_id_fk" FOREIGN KEY ("roster_cycle_id") REFERENCES "public"."roster_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_lineups" ADD CONSTRAINT "fixture_lineups_fixture_id_fixtures_id_fk" FOREIGN KEY ("fixture_id") REFERENCES "public"."fixtures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_lineups" ADD CONSTRAINT "fixture_lineups_ruleset_id_rulesets_id_fk" FOREIGN KEY ("ruleset_id") REFERENCES "public"."rulesets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_lineups" ADD CONSTRAINT "fixture_lineups_captain_id_ipl_players_id_fk" FOREIGN KEY ("captain_id") REFERENCES "public"."ipl_players"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_lineups" ADD CONSTRAINT "fixture_lineups_vice_captain_id_ipl_players_id_fk" FOREIGN KEY ("vice_captain_id") REFERENCES "public"."ipl_players"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_lineups" ADD CONSTRAINT "fixture_lineups_impact_player_id_ipl_players_id_fk" FOREIGN KEY ("impact_player_id") REFERENCES "public"."ipl_players"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_user_player_points" ADD CONSTRAINT "fixture_user_player_points_fixture_user_points_id_fixture_user_points_id_fk" FOREIGN KEY ("fixture_user_points_id") REFERENCES "public"."fixture_user_points"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_user_player_points" ADD CONSTRAINT "fixture_user_player_points_player_id_ipl_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."ipl_players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_user_points" ADD CONSTRAINT "fixture_user_points_roster_cycle_id_roster_cycles_id_fk" FOREIGN KEY ("roster_cycle_id") REFERENCES "public"."roster_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_user_points" ADD CONSTRAINT "fixture_user_points_fixture_id_fixtures_id_fk" FOREIGN KEY ("fixture_id") REFERENCES "public"."fixtures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_user_points" ADD CONSTRAINT "fixture_user_points_lineup_id_fixture_lineups_id_fk" FOREIGN KEY ("lineup_id") REFERENCES "public"."fixture_lineups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roster_cycle_players" ADD CONSTRAINT "roster_cycle_players_roster_cycle_id_roster_cycles_id_fk" FOREIGN KEY ("roster_cycle_id") REFERENCES "public"."roster_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roster_cycle_players" ADD CONSTRAINT "roster_cycle_players_player_id_ipl_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."ipl_players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roster_cycles" ADD CONSTRAINT "roster_cycles_franchise_id_fantasy_franchises_id_fk" FOREIGN KEY ("franchise_id") REFERENCES "public"."fantasy_franchises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roster_cycles" ADD CONSTRAINT "roster_cycles_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "fantasy_franchises_user_id_idx" ON "fantasy_franchises" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fixture_lineup_players_lineup_player_idx" ON "fixture_lineup_players" USING btree ("fixture_lineup_id","player_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fixture_lineups_cycle_fixture_idx" ON "fixture_lineups" USING btree ("roster_cycle_id","fixture_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roster_cycle_players_cycle_player_idx" ON "roster_cycle_players" USING btree ("roster_cycle_id","player_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roster_cycles_franchise_match_idx" ON "roster_cycles" USING btree ("franchise_id","match_id");