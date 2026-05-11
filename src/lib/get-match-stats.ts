import axios from 'axios'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { CRICBUZ_API_KEY, IS_DEVELOPMENT } from '@/config'

export interface ParsedPlayerStats {
    name: string
    cricbuzzPlayerId?: string
    batting: {
        runs: number
        fours: number
        sixes: number
        ballsFaced: number
        isOut: boolean
    }
    bowling: {
        wickets: number
        oversBowled: number
        runsConceded: number
        maidens: number
        dots: number
        lbwBowledCount: number
    }
    fielding: {
        catches: number
        stumpings: number
        runOutDirect: number
    }
}

interface CricbuzzBatsmanEntry {
    id?: number
    name: string
    runs: number
    fours: number
    sixes: number
    balls: number
    outdec: string
}

interface CricbuzzBowlerEntry {
    id?: number
    name: string
    wickets: number
    overs: string
    runs: number
    maidens: number
    dots?: number
}

interface CricbuzzScorecardInnings {
    batsman?: CricbuzzBatsmanEntry[]
    bowler?: CricbuzzBowlerEntry[]
}

interface CricbuzzMatchDetails {
    scorecard?: CricbuzzScorecardInnings[]
}

const DEFAULT_LOCAL_SCORECARD = 'rr_v_gt'

const readLocalScorecard = async (scorecardName: string): Promise<CricbuzzMatchDetails> => {
    if (!/^[a-z0-9_-]+$/i.test(scorecardName)) {
        throw new Error('Invalid local scorecard name')
    }

    const scorecardPaths = [
        path.join(process.cwd(), 'src/core/db/scorecard', `${scorecardName}.json`),
        path.join(process.cwd(), 'server/src/core/db/scorecard', `${scorecardName}.json`)
    ]

    for (const scorecardPath of scorecardPaths) {
        try {
            const file = await readFile(scorecardPath, 'utf8')
            return JSON.parse(file) as CricbuzzMatchDetails
        } catch (error) {
            const nodeError = error as NodeJS.ErrnoException
            if (nodeError.code !== 'ENOENT') throw error
        }
    }

    throw new Error(`Local scorecard not found: ${scorecardName}`)
}

export async function getMatchDetails(cribuzMatchId: string): Promise<CricbuzzMatchDetails> {
    if (IS_DEVELOPMENT) {
        const scorecardName = cribuzMatchId.startsWith('local:')
            ? cribuzMatchId.replace('local:', '')
            : DEFAULT_LOCAL_SCORECARD

        return readLocalScorecard(scorecardName)
    }

    if (cribuzMatchId.startsWith('local:')) {
        throw new Error('Local scorecards can only be used in development')
    }

    const options = {
        method: 'GET',
        url: `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${cribuzMatchId}/hscard`,
        headers: {
            'x-rapidapi-key': CRICBUZ_API_KEY,
            'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com',
            'Content-Type': 'application/json'
        }
    }

    const response = await axios.request(options)
    return response.data as CricbuzzMatchDetails
    // try {
    // } catch (error) {
    //     // logger.error(`Cricbuzz API Error: ${error}`)
    //     throw error
    // }
}

/**
 * Transforms raw Cricbuzz JSON into a map of player stats.
 */
export function processCricbuzzStats(data: CricbuzzMatchDetails): Map<string, ParsedPlayerStats> {
    const statsMap = new Map<string, ParsedPlayerStats>()
    const getScorecardKey = (name: string, cricbuzzPlayerId?: number | string): string => {
        if (cricbuzzPlayerId !== undefined && cricbuzzPlayerId !== null) {
            return `cricbuzz:${String(cricbuzzPlayerId)}`
        }

        return `name:${name.toLowerCase()}`
    }
    const getOrCreate = (name: string, cricbuzzPlayerId?: number | string): ParsedPlayerStats => {
        const key = getScorecardKey(name, cricbuzzPlayerId)

        if (!statsMap.has(key)) {
            statsMap.set(key, {
                name,
                cricbuzzPlayerId:
                    cricbuzzPlayerId !== undefined && cricbuzzPlayerId !== null
                        ? String(cricbuzzPlayerId)
                        : undefined,
                batting: { runs: 0, fours: 0, sixes: 0, ballsFaced: 0, isOut: false },
                bowling: {
                    wickets: 0,
                    oversBowled: 0,
                    runsConceded: 0,
                    maidens: 0,
                    dots: 0,
                    lbwBowledCount: 0
                },
                fielding: { catches: 0, stumpings: 0, runOutDirect: 0 }
            })
        }
        return statsMap.get(key)!
    }

    data.scorecard?.forEach((innings) => {
        // 1. Process Batting
        innings.batsman?.forEach((b) => {
            const player = getOrCreate(b.name, b.id)
            player.batting.runs += b.runs
            player.batting.fours += b.fours
            player.batting.sixes += b.sixes
            player.batting.ballsFaced += b.balls
            if (b.outdec !== 'not out' && b.outdec !== '') {
                player.batting.isOut = true
            }

            // 2. Parse Fielding from outdec (e.g., "c Dhoni b Jadeja")
            const out = (b.outdec || '').toLowerCase()
            if (out.startsWith('c & b ')) {
                const bowlerName = b.outdec.substring(6).trim()
                getOrCreate(bowlerName).fielding.catches += 1
            } else if (out.startsWith('c ')) {
                // Extract fielder name between 'c ' and ' b '
                const fielderName = b.outdec.split(' b ')[0].substring(2).trim()
                getOrCreate(fielderName).fielding.catches += 1
            } else if (out.startsWith('st ')) {
                const fielderName = b.outdec.split(' b ')[0].substring(3).trim()
                getOrCreate(fielderName).fielding.stumpings += 1
            } else if (out.includes('run out')) {
                // Simplified: extract name inside (brackets)
                const match = b.outdec.match(/\(([^)]+)\)/)
                if (match) {
                    getOrCreate(match[1].trim()).fielding.runOutDirect += 1
                }
            }

            // 3. Parse Bowled/LBW for Bowler Bonus
            if (out.startsWith('b ')) {
                const bowlerName = b.outdec.substring(2).trim()
                getOrCreate(bowlerName).bowling.lbwBowledCount += 1
            } else if (out.startsWith('lbw b ')) {
                const bowlerName = b.outdec.substring(6).trim()
                getOrCreate(bowlerName).bowling.lbwBowledCount += 1
            }
        })

        // 4. Process Bowling
        innings.bowler?.forEach((bw) => {
            const player = getOrCreate(bw.name, bw.id)
            player.bowling.wickets += bw.wickets
            player.bowling.oversBowled += parseFloat(bw.overs)
            player.bowling.runsConceded += bw.runs
            player.bowling.maidens += bw.maidens
            player.bowling.dots += bw.dots || 0
            // lbwBowledCount is already accumulated correctly from batsman processing
        })
    })

    return statsMap
}
