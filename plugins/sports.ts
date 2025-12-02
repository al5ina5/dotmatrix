import { LEDPlugin } from './types';
import { withPluginErrorHandling } from '@/lib/pluginHelpers';

interface SportsPluginParams {
    league: string;
    limit?: number;
}

export const SportsPlugin: LEDPlugin<SportsPluginParams> = {
    id: 'sports',
    name: 'Sports Scores',
    description: 'Display live sports scores from ESPN',
    defaultInterval: 120000, // Update every 2 minutes
    configSchema: [
        {
            key: 'league',
            label: 'League',
            type: 'select',
            defaultValue: 'nfl',
            options: [
                { value: 'nfl', label: 'NFL' },
                { value: 'nba', label: 'NBA' },
                { value: 'mlb', label: 'MLB' },
                { value: 'nhl', label: 'NHL' },
                { value: 'soccer', label: 'Soccer (EPL)' },
            ]
        },
        {
            key: 'limit',
            label: 'Number of Games',
            type: 'number',
            defaultValue: 3,
            min: 1,
            max: 10,
        }
    ],
    fetch: async (params) => withPluginErrorHandling(
        'sports',
        async () => {
            const league = params.league || 'nfl';
            const limit = params.limit || 3;

            // ESPN public scoreboard API
            const leagueMap: Record<string, string> = {
                nfl: 'football/nfl',
                nba: 'basketball/nba',
                mlb: 'baseball/mlb',
                nhl: 'hockey/nhl',
                soccer: 'soccer/eng.1'
            };

            const espnLeague = leagueMap[league] || 'football/nfl';
            const response = await fetch(
                `https://site.api.espn.com/apis/site/v2/sports/${espnLeague}/scoreboard`
            );

            if (!response.ok) throw new Error('Failed to fetch sports data');

            const data = await response.json();
            const events = data.events || [];

            if (events.length === 0) {
                return `No ${league.toUpperCase()} games today`;
            }

            const gameStrings = events.slice(0, limit).map((event: any) => {
                const competition = event.competitions?.[0];
                if (!competition) return null;

                const competitors = competition.competitors || [];
                const home = competitors.find((c: any) => c.homeAway === 'home');
                const away = competitors.find((c: any) => c.homeAway === 'away');

                const homeTeam = home?.team?.abbreviation || 'HOME';
                const awayTeam = away?.team?.abbreviation || 'AWAY';
                const homeScore = home?.score || '0';
                const awayScore = away?.score || '0';

                const status = competition.status?.type?.shortDetail || 'Scheduled';

                return `${awayTeam} ${awayScore} - ${homeTeam} ${homeScore} (${status})`;
            }).filter(Boolean);

            return gameStrings.length > 0
                ? gameStrings.join(' | ')
                : `No ${league.toUpperCase()} games available`;
        },
        `🏀 ${params.league?.toUpperCase() || 'Sports'}: Loading scores...`
    )
};

