CREATE TYPE "public"."match_status" AS ENUM('scheduled', 'live', 'completed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('PLAYER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."player_role" AS ENUM('Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper');--> statement-breakpoint
CREATE TYPE "public"."team" AS ENUM('CSK', 'MI', 'RCB', 'KKR', 'SRH', 'DC', 'PBKS', 'RR', 'GT', 'LSG');--> statement-breakpoint
CREATE TABLE "fantasy_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"match_id" uuid NOT NULL,
	"team_name" text,
	"players" text[] NOT NULL,
	"captain_id" uuid NOT NULL,
	"vice_captain_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fantasy_teams_team_name_unique" UNIQUE("team_name")
);
--> statement-breakpoint
CREATE TABLE "fixtures" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" uuid NOT NULL,
	"team_a" text NOT NULL,
	"team_b" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"is_processed" boolean DEFAULT false NOT NULL,
	"match_number" text,
	"venue_id" text,
	"match_result" text,
	"match_status" "match_status"
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"role" "user_role" DEFAULT 'PLAYER' NOT NULL,
	"username" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"profile_image" text,
	"available_points" real DEFAULT 900 NOT NULL,
	"total_score" real DEFAULT 0 NOT NULL,
	"matches_played" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ipl_players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"ipl_team" "team" NOT NULL,
	"role" "player_role" NOT NULL,
	"profile_image_url" text NOT NULL,
	"is_overseas" boolean DEFAULT false NOT NULL,
	"cost" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"is_locked" boolean DEFAULT true NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fixture_id" text NOT NULL,
	"player_id" uuid NOT NULL,
	"runs" integer DEFAULT 0 NOT NULL,
	"fours" integer DEFAULT 0 NOT NULL,
	"sixes" integer DEFAULT 0 NOT NULL,
	"wickets" integer DEFAULT 0 NOT NULL,
	"catches" integer DEFAULT 0 NOT NULL,
	"runouts" integer DEFAULT 0 NOT NULL,
	"final_points" real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fantasy_teams" ADD CONSTRAINT "fantasy_teams_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_teams" ADD CONSTRAINT "fantasy_teams_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_stats" ADD CONSTRAINT "match_stats_fixture_id_fixtures_id_fk" FOREIGN KEY ("fixture_id") REFERENCES "public"."fixtures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_stats" ADD CONSTRAINT "match_stats_player_id_ipl_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."ipl_players"("id") ON DELETE no action ON UPDATE no action;