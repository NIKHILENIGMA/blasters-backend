# Blasters Server Plan

This document turns the future direction written under `What changes are expected:` into a concrete backend plan. The main goal is to lock the domain model first, then build schema, APIs, and scoring on top of that model without rework.

## 1. Planning Goal

We are moving the application from:

- one mutable fantasy team per match
- 11-player selection
- captain and vice-captain only
- weak score explainability

to:

- one persistent user franchise identity
- one roster-cycle based 25-player squad per user
- one per-fixture playing 12 selected from that squad
- captain, vice-captain, and impact-player roles
- substitutes that can be promoted before fixture lock
- immutable lineup snapshots per fixture
- full per-user per-player points breakdown
- admin-controlled fixtures, cycle timing, and boosters

## 2. Current Backend Reality

The current backend still reflects an older product shape:

- `fantasy_teams` stores one team per user per match.
- selected players are stored as a plain array
- roles only support `captainId` and `viceCaptainId`
- `users.totalScore` is updated mutably
- `users.availablePoints` behaves like a wallet but is not tied cleanly to a cycle
- `match_stats` mixes raw stats with a final points column
- there is no strong separation between:
    - roster-cycle squad
    - fixture lineup snapshot
    - scoring ledger

This is why the next step should be a fresh schema redesign, not incremental patching on the current mutable model.

## 3. Agreed Product Rules

The following rules are now treated as agreed requirements.

### Franchise Identity

- A user has one long-lived fantasy identity.
- That identity includes:
    - team name
    - preset team logo

### Roster Cycle

- A roster cycle is a bounded game window controlled by admin.
- A user gets a budget of `2000` for that cycle.
- A user must buy exactly `25` players for the cycle.
- The `25` players are:
    - `12` active players for a fixture
    - `13` substitutes
- There is no overseas-player cap on the 25-player squad.
- Admin decides when squad lock happens by date/time.
- Once squad lock has passed, the user cannot buy a new player into that cycle.
- When the cycle ends, the wallet resets so the user can buy a fresh 25-player squad for the next cycle.

### Fixture Lineup

- For each fixture, a user selects:
    - `12` active players
    - `13` substitutes
    - `1` captain
    - `1` vice-captain
    - `1` impact player
- Users can swap active players and substitutes before fixture lock.
- Users can change roles before fixture lock.
- Captain, vice-captain, and impact player must be selected from the playing 12.

### Playing 12 Validation

Each fixture lineup must satisfy this exact composition:

- `4` batsmen
- `2` all-rounders
- `5` bowlers
- `1` wicketkeeper

Additional lineup rule:

- maximum `4` overseas players in the playing 12

Recommended implementation:

- store these validations in a configurable ruleset instead of hard-coding them in service logic

### Deadline Behavior

- Squad buying should be allowed only during an admin-controlled squad-building window.
- Fixture lineup changes should close one hour before fixture start time.
- If a user misses the fixture deadline, the previous saved lineup should auto-apply.

Important edge case still to define:

- for the first fixture of a cycle, if the user never submitted a lineup, there is no previous lineup to auto-apply

### Role Multipliers

- captain: `4x`
- vice-captain: `3x`
- impact player: `2.5x`

Important rule still to finalize:

- overlapping roles should be disallowed; one player should not be captain, vice-captain, and impact player at the same time

### Scoring Transparency

- Users must be able to see how many points they earned in a fixture.
- Users must be able to see which players contributed those points.
- Users must be able to see why extra points were awarded, including boosters.
- Past scoring must stay correct even if the user changes future lineups.

## 4. Key Design Decision

The backend should be split into four layers.

### A. Franchise Layer

This is the permanent user identity.

- team name
- team logo
- ownership and user linkage

### B. Roster Cycle Layer

This is the user squad for a bounded set of fixtures.

- 25-player squad
- budget tracking
- lock timing
- wallet reset behavior

### C. Fixture Lineup Layer

This is the exact immutable lineup snapshot for one IPL fixture.

- 12 active players
- 13 substitutes
- captain, vice-captain, impact player
- fixture-specific lock state

### D. Scoring Ledger Layer

This is the system of record for trust and auditability.

- raw player stats for a fixture
- scoring rules applied
- user fixture totals
- per-user per-player breakdown
- booster bonuses and reasons

Without this separation, the product will keep suffering from ambiguous state and score disputes.

## 5. Proposed Backend Model

Names can still change, but this structure should remain.

### 5.1 Franchise Tables

#### `fantasy_franchises`

One row per user.

Suggested fields:

- `id`
- `user_id`
- `team_name`
- `team_logo`
- `created_at`
- `updated_at`

### 5.2 Roster Cycle Tables

#### `roster_cycles`

One row per franchise per game cycle.

Suggested fields:

- `id`
- `franchise_id`
- `match_id`
- `budget_total`
- `budget_used`
- `wallet_reset_amount`
- `squad_lock_at`
- `buy_window_open_at`
- `buy_window_close_at`
- `is_squad_locked`
- `started_at`
- `ended_at`
- `created_at`
- `updated_at`

Notes:

- `match_id` should point to the current `matches` table if that table continues to represent a cycle/session container.
- The current `matches` table is not a real IPL fixture table. It behaves more like a cycle/session definition.
- Long term, naming should be cleaned up to avoid confusion between `matches` and `fixtures`.

#### `roster_cycle_players`

Join table for the 25-player squad.

Suggested fields:

- `id`
- `roster_cycle_id`
- `player_id`
- `purchase_price`
- `created_at`

Constraints:

- unique `(roster_cycle_id, player_id)`
- exactly 25 players enforced in service layer

### 5.3 Rules and Config Tables

#### `rulesets`

Configurable rule definition owned by admin.

Suggested fields:

- `id`
- `name`
- `scope` (`cycle`, `fixture`, `global`)
- `config_json`
- `is_active`
- `created_at`
- `updated_at`

Example config:

```json
{
    "total_players": 12,
    "roles": {
        "batsman": { "min": 4 },
        "bowler": { "min": 5 },
        "wicketKeeper": { "min": 1 },
        "allRounder": { "min": 2 }
    },
    "overseas": { "max": 4 },
    "multipliers": {
        "captain": 4,
        "viceCaptain": 3,
        "impactPlayer": 2.5
    }
}
```

Recommended use:

- lineup validation
- overseas cap
- role multiplier config
- future rule changes without code edits

### 5.4 Fixture Lineup Tables

#### `fixture_lineups`

One row per roster cycle per fixture.

Suggested fields:

- `id`
- `roster_cycle_id`
- `fixture_id`
- `ruleset_id`
- `status` (`draft`, `locked`, `scored`)
- `captain_id`
- `vice_captain_id`
- `impact_player_id`
- `submitted_at`
- `locked_at`
- `lineup_lock_at`
- `auto_applied_from_lineup_id`
- `created_at`
- `updated_at`

Constraints:

- unique `(roster_cycle_id, fixture_id)`

#### `fixture_lineup_players`

Snapshot of lineup membership for one fixture.

Suggested fields:

- `id`
- `fixture_lineup_id`
- `player_id`
- `selection_type` (`PLAYING`, `SUBSTITUTE`)
- `created_at`

Constraints:

- unique `(fixture_lineup_id, player_id)`
- exactly 12 `PLAYING`
- exactly 13 `SUBSTITUTE`

This table is the source of truth for lineup history.

### 5.5 Scoring Tables

#### `fixture_player_stats`

Raw scorecard entered by admin for one real fixture and one real player.

Suggested fields:

- `id`
- `fixture_id`
- `player_id`
- `runs`
- `fours`
- `sixes`
- `wickets`
- `catches`
- `runouts`
- `hat_tricks`
- `stumpings` if needed
- `maidens` if needed
- `base_points`
- `created_at`
- `updated_at`

Recommendation:

- `base_points` should be neutral fantasy points before user-specific multipliers and bonuses

#### `fixture_user_points`

One row per user roster cycle per fixture.

Suggested fields:

- `id`
- `roster_cycle_id`
- `fixture_id`
- `lineup_id`
- `total_points`
- `rank_snapshot`
- `created_at`
- `updated_at`

#### `fixture_user_player_points`

Per-user per-player scoring breakdown for a fixture.

Suggested fields:

- `id`
- `fixture_user_points_id`
- `player_id`
- `selection_type`
- `is_captain`
- `is_vice_captain`
- `is_impact_player`
- `base_points`
- `multiplier`
- `bonus_points`
- `final_points`
- `breakdown_json`
- `created_at`

This is the main transparency table for disputes and UI explanations.

### 5.6 Booster Tables

#### `boosters`

Admin-defined reusable or fixture-specific bonus rules.

Suggested fields:

- `id`
- `name`
- `code`
- `description`
- `scope` (`global`, `cycle`, `fixture`)
- `config_json`
- `is_active`
- `created_at`
- `updated_at`

Examples:

- man of the match bonus `+500`
- milestone bonus for 100 runs
- campaign bonus for selected promotional rules

#### `fixture_booster_awards`

Resolved booster awards for a user and fixture.

Suggested fields:

- `id`
- `fixture_id`
- `booster_id`
- `roster_cycle_id`
- `player_id` optional
- `points_awarded`
- `reason`
- `created_at`

This allows the UI to say exactly why a user got extra points.

## 6. Validation and Scoring Rules

These rules should be encoded centrally, not scattered across route handlers.

### Roster Cycle Rules

- exact squad size: `25`
- budget total: `2000`
- overseas cap on squad: none
- squad lock time: admin controlled
- wallet reset when cycle ends

### Fixture Lineup Rules

- exact playing count: `12`
- exact substitute count: `13`
- max overseas in playing 12: `4`
- exact role composition:
    - `4 BAT`
    - `2 AR`
    - `5 BOWL`
    - `1 WK`
- captain, vice-captain, and impact player must come from the playing 12
- recommended: role overlap not allowed

### Deadline Rules

- buy window controlled by cycle timestamps
- lineup lock is one hour before fixture start by default
- fixture-level `lineup_lock_at` should allow admin override
- if a user misses lock, previous lineup auto-applies

### Scoring Rules

- base points come from `fixture_player_stats`
- multipliers come from lineup roles or active ruleset
- boosters are applied after base scoring and role multiplication
- all results must be persisted in ledger tables

### Score Aggregation Rules

- `users.totalScore` should not be the source of truth anymore
- historical scores must be derivable from fixture ledgers
- cached aggregates are acceptable for performance, but must be rebuildable

## 7. Recommended API Direction

The backend should move toward these responsibilities.

### Franchise APIs

- `POST /api/franchise`✅
    - create user fantasy identity with team name and logo
- `GET /api/franchise/me`✅
    - fetch franchise, active roster cycle, wallet status, and lock status

### Roster Cycle APIs

- `GET /api/roster-cycles/current` ✅
    - fetch the current active cycle for the user
- `PUT /api/roster-cycles/:matchId/squad` ✅
    - save or replace 25-player squad before squad lock
- `GET /api/roster-cycles/:matchId/squad` ✅
    - fetch current 25-player squad and wallet usage

### Fixture Lineup APIs

- `GET /api/fixtures/upcoming`
- `GET /api/lineups/:fixtureId`✅
    - fetch current draft or locked lineup for a fixture
- `PUT /api/lineups/:fixtureId`✅
    - submit playing 12 and roles for a fixture
- `GET /api/lineups/history/:fixtureId`
    - fetch immutable lineup snapshot and applied source

### Admin Cycle and Fixture APIs

- `POST /api/admin/matches`
    - create or update roster-cycle sessions
- `POST /api/admin/fixtures`
    - create fixtures from IPL schedule and control the game cycle
- `PATCH /api/admin/fixtures/:fixtureId/lock`
    - override lineup lock if needed

### Admin Scoring APIs

- `POST /api/admin/fixture-stats`
    - upsert raw player stats for a fixture
- `POST /api/admin/fixture-score/:fixtureId`
    - compute user points from locked lineups
- `GET /api/admin/fixture-score/:fixtureId`
    - audit a scoring run

### Admin Booster APIs

- `POST /api/admin/boosters`
    - create a booster definition
- `POST /api/admin/boosters/apply`
    - apply boosters to a fixture or cycle
- `GET /api/admin/boosters`
    - list booster rules

### User Transparency APIs

- `GET /api/results/:fixtureId`
    - total points earned by the user for a fixture
- `GET /api/results/:fixtureId/breakdown`
    - per-player contribution, multipliers, and boosters

## 8. Implementation Phases

This is the recommended sequence.

### Phase 1: Finalize Remaining Edge Rules

Confirm:

- what happens on the first fixture if there is no previous lineup to auto-apply
- whether overlapping roles are forbidden
- whether boosters are evaluated automatically or awarded manually by admin
- whether `users.availablePoints` remains a cache column or moves fully into cycle state

Deliverable:

- stable business-rules section in this document

### Phase 2: Redesign Database

Work to do:

- add franchise tables
- add roster-cycle tables
- add ruleset tables
- add lineup snapshot tables
- add scoring ledger tables
- add booster tables
- deprecate `fantasy_teams` as the main model

Deliverable:

- Drizzle schema update
- migration files
- seed compatibility plan

### Phase 3: Refactor Domain Services

Work to do:

- split current `TeamService` into:
    - franchise service
    - roster-cycle service
    - lineup service
    - scoring service
    - booster service
- centralize validation logic
- centralize lock logic

Deliverable:

- testable service boundaries

### Phase 4: Build Franchise and Squad Flow

Work to do:

- create franchise identity
- assign team logo
- manage 25-player squad per cycle
- enforce budget and squad lock rules

Deliverable:

- stable backend for cycle squad setup

### Phase 5: Build Fixture Lineup Flow

Work to do:

- create per-fixture lineup draft
- validate 12-player composition
- save roles
- lock snapshot at deadline
- auto-apply previous lineup when required
- allow substitute swaps before lock

Deliverable:

- stable backend for daily fixture management

### Phase 6: Build Scoring Ledger

Work to do:

- admin enters raw stats
- compute neutral player fantasy points
- apply lineup multipliers
- apply boosters
- persist per-user per-player breakdown
- persist per-fixture totals

Deliverable:

- auditable scoring results

### Phase 7: Leaderboard and History

Work to do:

- derive leaderboards from ledger data
- expose match history with full lineup snapshot
- expose scoring explanation endpoints
- remove dependence on mutable score-only views

Deliverable:

- transparent rankings and history

## 9. Migration Strategy

You chose a fresh redesign, which is the correct direction here.

Recommended approach:

- keep old tables only as temporary compatibility scaffolding
- build new flows against the new schema
- cut routes and services over one domain at a time
- verify scoring parity where possible
- remove dead mutable-score logic once the new ledger path is stable

If this project is still pre-production or low-data, a clean cutover is much cheaper than trying to preserve the old data model.

## 10. Risks

The main risks are:

- mixing roster-cycle squad and fixture lineup in one table again
- keeping `users.totalScore` as the only reliable score record
- encoding weekend behavior as special-case logic when fixture timestamps already solve it
- building boosters as ad hoc exceptions instead of a rules-driven system
- leaving the current `matches` versus `fixtures` naming ambiguity unresolved
- auto-applying a previous lineup without defining first-fixture behavior

## 11. Recommended Immediate Next Steps

Before code work starts, this plan still needs final decisions on these points:

1. If the first fixture in a cycle arrives and the user never submitted a lineup, what should happen?

- I don't know that match should be gone for that user but we can make the team for next matches.

2. Are captain, vice-captain, and impact player always mutually exclusive roles?

- Yes captain, vice captain and impact player are three 3 different players

3. Should boosters be:
    - manually awarded by admin: I think admin will provide the logic from the client side and server adpat it program
    - automatically evaluated from raw stats: booster should apply after the final scoring for that user after a match
    - or both
4. Should `users.availablePoints` and `users.totalScore` remain as cache columns only, or be removed from primary business logic entirely?

- I we remove this from primary logic entirely so user has owns logic instead of handling points and wallet state

5. Should the current `matches` table be kept as the roster-cycle container, or renamed in the redesign to reduce confusion?

- But the points current schema is in production so if we change the naming we have to take of the production environment as well

## 12. Suggested Discussion Outcome

Planning is complete once this file contains:

- final business rules
- final table list
- final API list
- migration decision
- implementation order

At that point, schema work can begin.
