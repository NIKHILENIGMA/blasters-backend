import {
    boolean,
    jsonb,
    pgEnum,
    pgTable,
    real,
    text,
    timestamp,
    uniqueIndex,
    uuid
} from 'drizzle-orm/pg-core'

import { fixtures } from './fixtures'
import { players } from './players'
import { rosterCycles } from './roster-cycles'
import { rulesets } from './rulesets'

export const fixtureLineupStatuses = ['draft', 'locked', 'scored'] as const
export const fixtureLineupStatusEnum = pgEnum('fixture_lineup_status', fixtureLineupStatuses)

export const lineupSelectionTypes = ['PLAYING', 'SUBSTITUTE'] as const
export const lineupSelectionTypeEnum = pgEnum('lineup_selection_type', lineupSelectionTypes)

export const fixtureLineups = pgTable(
    'fixture_lineups',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        rosterCycleId: uuid('roster_cycle_id')
            .references(() => rosterCycles.id, { onDelete: 'cascade' })
            .notNull(),
        fixtureId: text('fixture_id')
            .references(() => fixtures.id, { onDelete: 'cascade' })
            .notNull(),
        rulesetId: uuid('ruleset_id').references(() => rulesets.id),
        status: fixtureLineupStatusEnum('status').default('draft').notNull(),
        captainId: uuid('captain_id')
            .references(() => players.id, { onDelete: 'restrict' })
            .notNull(),
        viceCaptainId: uuid('vice_captain_id')
            .references(() => players.id, { onDelete: 'restrict' })
            .notNull(),
        impactPlayerId: uuid('impact_player_id')
            .references(() => players.id, { onDelete: 'restrict' })
            .notNull(),
        submittedAt: timestamp('submitted_at').defaultNow().notNull(),
        lockedAt: timestamp('locked_at'),
        lineupLockAt: timestamp('lineup_lock_at'),
        autoAppliedFromLineupId: uuid('auto_applied_from_lineup_id'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull()
    },
    (table) => [
        uniqueIndex('fixture_lineups_cycle_fixture_idx').on(table.rosterCycleId, table.fixtureId)
    ]
)

export const fixtureLineupPlayers = pgTable(
    'fixture_lineup_players',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        fixtureLineupId: uuid('fixture_lineup_id')
            .references(() => fixtureLineups.id, { onDelete: 'cascade' })
            .notNull(),
        playerId: uuid('player_id')
            .references(() => players.id, { onDelete: 'cascade' })
            .notNull(),
        selectionType: lineupSelectionTypeEnum('selection_type').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull()
    },
    (table) => [
        uniqueIndex('fixture_lineup_players_lineup_player_idx').on(
            table.fixtureLineupId,
            table.playerId
        )
    ]
)

export const fixtureUserPoints = pgTable('fixture_user_points', {
    id: uuid('id').defaultRandom().primaryKey(),
    rosterCycleId: uuid('roster_cycle_id')
        .references(() => rosterCycles.id, { onDelete: 'cascade' })
        .notNull(),
    fixtureId: text('fixture_id')
        .references(() => fixtures.id, { onDelete: 'cascade' })
        .notNull(),
    lineupId: uuid('lineup_id')
        .references(() => fixtureLineups.id, { onDelete: 'cascade' })
        .notNull(),
    totalPoints: real('total_points').default(0).notNull(),
    rankSnapshot: real('rank_snapshot'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const fixtureUserPlayerPoints = pgTable('fixture_user_player_points', {
    id: uuid('id').defaultRandom().primaryKey(),
    fixtureUserPointsId: uuid('fixture_user_points_id')
        .references(() => fixtureUserPoints.id, { onDelete: 'cascade' })
        .notNull(),
    playerId: uuid('player_id')
        .references(() => players.id, { onDelete: 'cascade' })
        .notNull(),
    selectionType: lineupSelectionTypeEnum('selection_type').notNull(),
    isCaptain: boolean('is_captain').default(false).notNull(),
    isViceCaptain: boolean('is_vice_captain').default(false).notNull(),
    isImpactPlayer: boolean('is_impact_player').default(false).notNull(),
    basePoints: real('base_points').default(0).notNull(),
    multiplier: real('multiplier').default(1).notNull(),
    bonusPoints: real('bonus_points').default(0).notNull(),
    finalPoints: real('final_points').default(0).notNull(),
    breakdown: jsonb('breakdown').$type<Record<string, unknown>>().notNull()
})
