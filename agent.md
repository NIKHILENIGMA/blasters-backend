# Server Agent Guide

This directory contains the backend for the Blasters fantasy cricket platform.

## Overview

- Runtime: Node.js with TypeScript
- Framework: Express 5
- Database: PostgreSQL with Drizzle ORM
- Auth: Clerk
- Validation: Zod
- Logging: Pino and Morgan

## Important Paths

- `src/server.ts`: server entrypoint
- `src/app.ts`: Express app setup
- `src/modules/`: feature modules such as `user`, `team`, `players`, `admin`, and `webhooks`
- `src/core/db/`: database connection, schema, migrations, and seeds
- `src/config/`: environment and application configuration
- `src/middlewares/`: shared middleware

## Common Commands

Run these from the `server` directory:

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint:eslint
pnpm format:fix
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:seed
```

## Project Notes

- The backend supports fantasy team management, player data, admin workflows, and Clerk webhook syncing.
- Database migrations live in `src/core/db/migrations/`.
- Seed scripts live in `src/core/db/seeds/`.
- Environment variables are defined through `.env` and `.env.example`.

What changes are expected:

- Team Management:
    - Currently user can create team using with 11 players and assign a role of captain/vice-captain to player. I want to introduce that create team using 12 players with roles like captain, vice-captain and impact-player + 10 substitute players.
    - Also user can create single team only which consist Team name and team logo (preset from the directory). This name will remain and logo will remain for all the matches.
    - But I want to make sure that user can select their 22 players at once before team lock-in mechanism once it is lock they can not bring a new player from the player list.
    - Currently user pick 11 players for 4 or 5 matches and they only change captain/vice-captain for every match.
    - So this also solve one issue that user can change captain/vice-captain for Saturday & Sunday match.
    - I want now that they can change captain/vice-captain/impact player also change player from substitute for every match e.g. MI v CSK if they have player in substitute they bring in playing 12 also assign then new role (so game become for engaging for each day match).
    - So the flow will works like they have some budget they have to take 22 players from it. Then they have to choose players 12 from it rest will be substitutes, they can make changes for 6:30 pm every for each match. after that no changes for particular match. also on Saturday & Sunday where two matches so for that case they can first change before 2:30 pm and seconday change before 6:30 pm.
    - User can see their past matches team like what their playing 12, who was the cap/vice-cap/IP and what was their bench in the history section.
- Team Validation:
    - One problem some user taking only Batsman's for the matches to get maximum points so I want to implement that even they have 22 players but their playing 12 should a constrain of 4 bats, 2 All rounders, 5 bowlers, 1 Wicketkeeper. So before saving team for a particular match this validation has to pass or last match team will be consider for that match.
- Scoring Management:
    - Currently we are sending each player runs, catches, runout, wickets, then insert the raw data in match-stats table based on then we bring each team can which player is playing what is their role calculate the total points and store it in user table.
    - This mutable approach confused/ doubt user how much they gain points from that particular match, to solve this we need a table that store player points for that particular match with breakdown so when user see their past match team they can see
      e.g. Sakshi and Viraj both have Virat kohli and rajat patidar but based on their team role same players will give differents points to them like sakshi get Virat kohli: 1500 points, Rajat Patidar: 120 points and viraj will get Virat kohli: 500 points, Rajat Patidar: 800 points so we have to take of this which will help build trust. Also we can show much total points they get from that particular match as well.
    - Since we are store team per match so admin do not has to remember/worry that if user will change the team then how can I give scoring to user change team.
