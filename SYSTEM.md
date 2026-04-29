Based on my exploration of the server-side code, here is a breakdown of the Franchise APIs and the logic driving them. The system follows a two-tier selection process: first, users pick a broad
25-player squad for a match cycle, and then they select a 12-player playing lineup for each individual fixture within that cycle.

1. Franchise Management

- POST / (createFranchise):
    - Logic: Initializes a user's fantasy team. It enforces a strict "one franchise per user" rule.
    - Data: Stores the team name and logo.
- GET /me (getFranchiseOverview):
    - Logic: The "Dashboard" API. It fetches franchise details, identifies if there's an active match window (based on the current server time), and returns the current roster of players if one exists.

2. Squad Building (The 25-Player Pool)

- GET /roster-cycles/current: Fetches the status of the current active squad and the match window it belongs to.
- PUT /roster-cycles/:matchId/squad (saveSquad):
    - Logic: This is where users commit their primary pool of players.
    - Constraints:
        - Buy Window: Only allows saving if the match's buyWindow is open and not locked.
        - Size: Must select exactly 25 players.
        - Budget: Total player costs must not exceed 2000 credits.
    - Transaction: It clears any previous squad for that cycle and replaces it with the new selection.

3. Fixtures & Lineups (The Playing 12)

- GET /fixtures/upcoming: Lists all individual matches (fixtures) occurring within the current roster cycle window.
- GET /lineups/:fixtureId (getFixtureLineup):
    - Logic: Fetches the 12 starters and 13 substitutes for a specific match.
    - Auto-Fallback: If a user forgets to set a lineup and the match starts, the server automatically attempts to "clone" the lineup from the user's most recent previous fixture in the same cycle.
- PUT /lineups/:fixtureId (saveFixtureLineup):
    - Logic: Validates and saves the active lineup for a specific match.
    - Strict Validations:
        - Source Pool: All 12 starters + 13 subs must come from the 25 players previously saved in the saveSquad step.
        - Roles: Exactly 1 Captain, 1 Vice-Captain, and 1 Impact Player must be designated from the playing 12.
        - Composition Rules:
            - Minimums: 4 Batsmen, 5 Bowlers, 1 Wicket-Keeper, 2 All-Rounders.
            - Overseas Limit: Maximum of 4 overseas players allowed in the playing 12.
        - Locking: Prevents changes if the current time is within 60 minutes of the match start.

Key Architectural Patterns

- Transaction-Based Saving: Both squad and lineup updates use database transactions to ensure that player links are never in a partial state.
- Ruleset Scoping: The logic supports "Global Rulesets" (defaulting to the IPL-style 4-overseas, specific role counts) but is designed to allow admin-defined rulesets per fixture if needed.
- Time-Gate Logic: Extensive use of lte/gte checks against lineupLockAt and buyWindowCloseAt to ensure competitive integrity.

---

The locking mechanism for the 25-player squad is a hybrid of automatic time-based locking and manual overrides.

According to the logic in franchise.service.ts (specifically the ensureWithinBuyWindow method), the system checks several fields in the matches table to decide if a
user can still save their squad:

1. Automatic Locking (Time-Based)
   The system automatically locks based on three specific timestamps:

- squadLockAt: If the current time passes this specific timestamp, the squad is locked immediately.
- buyWindowOpenAt / buyWindowCloseAt: These define the "Transfer Window." If the current time is outside this range, the API throws a ForbiddenError.
    - Note: If these aren't explicitly set, it defaults to the match.startTime and match.endTime.

2. Manual Locking (Admin Override)

- match.isLocked: This is a boolean flag in the database. If an admin sets this to true for a match cycle, it overrides everything and prevents any squad changes
  regardless of the time.

Summary of the Logic Flow
When a user tries to save their 25-player squad, the server runs this check:

1 // From server/src/modules/franchise/franchise.service.ts
2
3 if (match.isLocked || (match.squadLockAt && now > match.squadLockAt)) {
4 throw new ForbiddenError('Squad selection is locked for this cycle')
5 }
6
7 if (now < windowOpenAt || now > windowCloseAt) {
8 throw new ForbiddenError('Squad changes are outside the active buy window')
9 }

In short:

- Admins set the schedule (the "buy window" and "lock time").
- The System then handles the locking automatically once those times are reached.
- Admins can also hit a "Panic Button" (isLocked) to manually freeze everything if needed.

---

The scoring mechanism is primarily driven by the AdminService.calculateFantasyPoints method. Here is the logic for how points are calculated and distributed:

1. Core API: POST /api/admin/matches/:matchId/process

- Purpose: Triggered by an admin after a fixture ends to calculate and distribute points to every user who participated.
- Payload: Includes playerPerformances (individual stats for each player in that match) and the fixtureId.

2. Point Calculation Logic (The Math)
   The system calculates a Base Score for each real-world player using this formula:

- Runs: +1 point per run.
- Fours: +6 points.
- Sixes: +10 points.
- Catches: +30 points.
- Run-outs: +50 points.
- Wickets:
    - Standard: +15 points per wicket.
    - Haul Bonus: If a player takes 5 or more wickets, their total wicket points are tripled (3x).

3. Fantasy Multipliers (The Strategy)
   When applying these base points to a user's fantasy team, the system checks the player's role in that specific lineup:

- Captain: 4x multiplier.
- Vice-Captain: 3x multiplier.
- Impact Player: 2.5x multiplier.
- Playing 12: 1x multiplier.
- Substitute: 0 points (unless a booster is applied).

4. Processing Workflow
   When the admin hits "Process":
1. Stats Persistence: The raw player stats are saved to the match_stats table for historical tracking.
1. Lineup Retrieval: The system finds every user's lineup for that fixture. If a user didn't set one, it auto-applies their previous one.
1. Booster Integration: It checks for any "Boosters" (like point multipliers or flat bonuses) awarded to specific players or users for that fixture.
1. Score Calculation: It iterates through every player in every user's lineup, applies the relevant multiplier (Captain/VC/Impact), and sums them up.
1. Ranking Snapshot: It ranks all users for that specific fixture and saves a rankSnapshot.
1. Global Update: The user's total tournament score (users.totalScore) is incremented by their points from this match.
1. Completion: The fixture is marked as isProcessed: true and the status is set to completed.

1. Key Tables Involved

- fixtureUserPoints: Stores the total points a user earned in a single match and their rank.
- fixtureUserPlayerPoints: Stores a line-by-line breakdown (Base Points vs Multiplier) for every player in a user's lineup.
- users: The final destination where totalScore is updated.

This mechanism ensures that scoring is transparent (via the breakdown table) and handles high volumes of users efficiently using a single transaction block for the
entire calculation.

---

Yes, exactly. The system is designed to provide a transparent, player-by-player breakdown.

When the admin processes a match, it populates the fixture_user_player_points table. Here is how that translates to what the end-user sees:

1. Individual Player Breakdown
   The user-facing API (GET /lineups/:fixtureId) is designed to return not just the players, but their performance data once the match is scored. In the backend, the
   fixture_user_player_points table stores:

- basePoints: What the player earned in the real match.
- multiplier: 4x for Captain, 3x for Vice-Captain, etc.
- finalPoints: The total points that specific player contributed to the user's team (basePoints \* multiplier).

2. The "Scored" Status
   In AdminService.ts, once calculation is finished, the lineup status is updated:
   1 await tx.update(fixtureLineups)
   2 .set({
   3 status: 'scored', // This flag tells the UI to show points instead of just the names
   4 updatedAt: new Date()
   5 })
   6 .where(eq(fixtureLineups.id, target.lineup.id))

3. What the User Sees in the UI
   Because the backend saves the breakdown as a JSON object, the frontend can show a tooltip or a small label next to each player card:

- Example Player Card: "Virat Kohli"
- Status: Scored
- Base: 50 pts (e.g., 50 runs)
- Applied Multiplier: x4 (Captain)
- Net Contribution: 200 pts

4. Historical Verification
   Because the system takes a snapshot at the time of scoring, even if a player is traded out of the user's 25-man squad later, the user can still go back to that
   specific fixture and see exactly who they had and how many points they earned.

This ensures that the "Leaderboard" isn't just a magic number; users can "audit" their score by looking at each player's individual contribution.

---

I've noticed that getFixtureLineupPlayers doesn't currently include point data, which is an oversight I need to address. I'll now construct an example JSON response
based on the intended logic, assuming the points are correctly joined or fetched. This response will represent a "scored" fixture, illustrating how the frontend
would receive and display individual player performance.

```json
{
    "statusCode": 200,
    "message": "Fixture lineup fetched successfully",
    "data": {
        "fixture": {
            "id": "fix_789",
            "startTime": "2026-04-20T14:00:00Z",
            "matchId": "match_cycle_1",
            "teamA": "CSK",
            "teamB": "MI",
            "isProcessed": true,
            "matchStatus": "completed",
            "matchResult": "CSK won by 20 runs"
        },
        "lineup": {
            "id": "lineup_456",
            "status": "scored", // This is the key flag
            "captainId": "player_001",
            "viceCaptainId": "player_002",
            "impactPlayerId": "player_003"
        },
        "lineupPlayers": [
            {
                "id": "player_001",
                "name": "Ruturaj Gaikwad",
                "role": "Batsman",
                "iplTeam": "CSK",
                "selectionType": "PLAYING",
                "isCaptain": true,
                // Points data below (Backend joined from fixtureUserPlayerPoints)
                "performance": {
                    "basePoints": 50, // e.g., 50 runs
                    "multiplier": 4, // Captain bonus
                    "bonusPoints": 0,
                    "finalPoints": 200 // 50 * 4
                }
            },
            {
                "id": "player_002",
                "name": "Matheesha Pathirana",
                "role": "Bowler",
                "iplTeam": "CSK",
                "selectionType": "PLAYING",
                "isViceCaptain": true,
                "performance": {
                    "basePoints": 45, // e.g., 3 wickets
                    "multiplier": 3, // Vice-Captain bonus
                    "bonusPoints": 0,
                    "finalPoints": 135
                }
            },
            {
                "id": "player_003",
                "name": "Shivam Dube",
                "role": "All-Rounder",
                "iplTeam": "CSK",
                "selectionType": "PLAYING",
                "isImpactPlayer": true,
                "performance": {
                    "basePoints": 40,
                    "multiplier": 2.5, // Impact Player bonus
                    "bonusPoints": 0,
                    "finalPoints": 100
                }
            },
            {
                "id": "player_004",
                "name": "MS Dhoni",
                "role": "Wicket-Keeper",
                "iplTeam": "CSK",
                "selectionType": "PLAYING",
                "performance": {
                    "basePoints": 30, // e.g., 1 catch + quick 10 runs
                    "multiplier": 1, // Standard starter
                    "bonusPoints": 0,
                    "finalPoints": 30
                }
            }
            // ... rest of the 25 players (starters + subs)
        ],
        "summary": {
            "totalTeamPoints": 465, // Sum of all player finalPoints
            "userRank": 12 // Snapshot of user's rank in this match
        }
    }
}
```

Why this is important for the Frontend:

1. lineup.status === 'scored': The UI sees this and knows to switch from "Selection Mode" to "Result Mode."
2. multiplier: The UI can display a badge (e.g., C, VC, IP) and show the math: 50 x 4 = 200.
3. isProcessed: Tells the UI to show the "Final Result" banner.

I've noted that getFixtureLineupPlayers in the current code isn't performing the join with fixtureUserPlayerPoints.

---

1. Bulk Setup for Upcoming Matches
   Since the 25-player squad is already saved for the entire match cycle, the user doesn't need to "re-buy" players for each game.
    - The Flow: You can fetch all fixture IDs using GET /api/franchise/fixtures/upcoming.
    - User Liberty: The user can click through these fixtures and save a unique "Playing 12" for each one (e.g., picking a different Captain for a night match vs. a day
      match).
    - The "Set and Forget" Logic: Even if the user only sets the lineup for the first match, the backend's Auto-Apply logic (which we saw in admin.service.ts) will
      automatically carry that lineup forward to all subsequent matches in the cycle if they don't manually change them.

2. The History Section
   The data is already being captured in a way that makes a "History" or "Performance" view very easy to build.

- How to fetch it: You would call GET /api/franchise/lineups/:fixtureId for a fixture where isProcessed is true.
- The Implementation: As we discussed, once we add that small join to getFixtureLineupPlayers, the response will contain the basePoints, multiplier, and finalPoints
  for every player in that past match.
- UI Idea: In your History section, you can show a "Match Card" with the user's total points and rank for that game. When they click it, you show the SquadCanvas
  but with the player's scores displayed on their cards.

What's Missing?
To make the History section perfect, you might want to add one more API (or update an existing one) to fetch Completed Fixtures.
Currently, you have:

- GET /api/franchise/fixtures/upcoming

You could add:

- GET /api/franchise/fixtures/history — This would return all fixtures where isProcessed === true, allowing the user to pick a past match to view their performance.

Summary: Your plan for "Bulk Setup" and "History" is fully compatible with the current backend logic. You just need to ensure the GET lineup API includes the
calculated points from the fixture_user_player_points table!

---

Yes, the system is already designed to handle exactly that!

The backend uses a specific field called lineupLockAt in the fixtures table to enforce this. Here is how that 1-hour lock works in the current code:

1. The "1-Hour" Logic
   In AdminService.ts, when a new fixture is created, the system automatically calculates the lock time if the admin doesn't provide one:

1 // From server/src/modules/admin/admin.service.ts
2 lineupLockAt: data.lineupLockAt ?? new Date(data.startTime.getTime() - 60 _ 60 _ 1000)

- 60 _ 60 _ 1000 is exactly 60 minutes in milliseconds.
- So, if a match starts at 7:30 PM, the backend sets the lineupLockAt to 6:30 PM by default.

2. The Enforcement (Blocking the Save)
   When a user tries to save their Playing 12 or change roles (Captain/VC), the saveFixtureLineup method in FranchiseService.ts checks this time:

1 // From server/src/modules/franchise/franchise.service.ts
2 if (this.isFixtureLocked(fixture)) {
3 throw new ForbiddenError('Lineup changes are closed for this fixture')
4 }

If the server's current time is 6:31 PM, the API will reject the request with a 403 Forbidden error, making it impossible for the user to submit changes.

3. Admin Flexibility
   While the default is 1 hour, the system gives the Admin liberty:

- Standard Match: Lock at 60 mins before (default).
- Special Match: If the Admin wants to allow changes until 10 minutes before the toss, they can manually update the lineupLockAt for that specific fixture to 7:20
  PM. The backend will automatically respect that new time.

4. UI Feedback
   Because the GET /api/franchise/fixtures/upcoming API returns the lineupLockAt timestamp, you can use it in your frontend to:

- Show a Countdown Timer: "Locking in: 45m 10s".
- Disable the "Save" button: Automatically grey out the button exactly at 6:30 PM so the user knows they are too late.

In summary: You don't need to build anything new for this! The 1-hour lock is already the "out-of-the-box" behavior of your backend.

---

1. Leaderboard Snapshots: How they work
   The leaderboard doesn't just track a "Total Score"; it captures Historical Snapshots to allow for "Weekly" or "Match-Day" winners.

- The Snapshot: Every time an admin processes a fixture, the system calculates the points for every participating user and saves them in the fixtureUserPoints
  table.
- The Ranking Logic: Within the same transaction, the backend sorts all users by their points for that specific match and assigns a rankSnapshot (e.g., "User A was
  Rank #1 in Match 12").
- Tournament vs. Match:
    - Match Leaderboard: Fetched from fixtureUserPoints (Shows who won that night).
    - Global Leaderboard: Fetched from the users table where totalScore is updated cumulatively (Shows who is winning the season).

2. How Boosters Work
   Boosters are "power-ups" that can be awarded by admins or earned by users. They are stored in the fixtureBoosterAwards table.

- Player-Level Boosters: You can give a specific player extra points (e.g., "Double Points for Kohli tonight"). The scoring engine checks this map and adds the
  bonusPoints to that player's finalPoints.
- Fixture-Level Boosters: A flat point bonus for the user's entire team (e.g., "Loyalty Bonus: +50 points for playing 5 matches in a row").
- Logic: During the scoring loop, the system calls getBoosterContext, which gathers all active awards and injects them into the math before the final sum is saved.

3. Admin Verification (The Audit Trail)
   Admins can verify scores because the system creates a Granular Receipt for every user.

- The Breakdown: The table fixtureUserPlayerPoints acts as the evidence. It stores exactly:
    - What the player's base performance was.
    - What multiplier was used.
    - What bonuses were applied.
- Verification Flow: If a user complains "My score is wrong!", the Admin can look up that user's ID for that Match ID and see a line-by-line list of all 12 players
  and how their points were derived. This "Double-Entry" style logging makes it impossible for points to "disappear."

4. UI Flow: 25-Player Squad vs. 12-Player Lineup
   To avoid user confusion, you should treat these as two different "Mindsets":

- Step 1: The "Warehouse" (The 25-Player Squad)
    - UI Approach: Use a "Management" or "Draft" tab.
    - Guidance: Use a progress bar for the 2000 credits.
    - Analogy: Tell the user, "This is your Season Roster. You are the Franchise Owner picking your full squad for the week."
    - Constraint: They can't even see the "Match" tab until they have a full 25-player squad.

- Step 2: The "Battlefield" (The 12-Player Lineup)
    - UI Approach: Use a "Match Center" or "Upcoming Games" tab.
    - The Secret to Less Confusion: Filter the view. When a user enters a specific match (e.g., CSK vs MI), do NOT show them all 300+ IPL players. Only show them
      the 25 players they already own.
    - Guidance: Use a "Drag and Drop" pitch view.
    - Analogy: Tell the user, "You are the Coach. Pick your starting 12 from your squad for tonight's game."

Suggested "Guided Flow" UI Component:

1. Onboarding Overlay: When they first login, show a 3-step card:
    - "1. Recruit 25 stars with your 2000 credits."
    - "2. Before every match, pick your Playing 12 and Captain."
    - "3. Watch the match and climb the leaderboard!"
2. Status Badges: On the main dashboard, show a "Incomplete Lineup" warning for any upcoming fixture that hasn't had a manual lineup saved yet.

---
