import { DatasetVault } from './dataset-vault';
import { Participant, DataEvent, Ranking } from '../types/data-schema';

/**
 * KaggleImporter
 * This service handles the normalization of external Kaggle datasets 
 * into our internal Sports Data Vault format.
 */
export class KaggleImporter {
    /**
     * Process NFL Scores and Betting Data (spreadspoke)
     * This mimics the structure seen on Kaggle: https://www.kaggle.com/datasets/spreadspoke/nfl-scores-and-betting-data
     */
    static async importNFLBettingData(csvData: any[]) {
        console.log(`[KAGGER IMPORTER] Processing NFL Betting Dataset...`);

        const events: DataEvent[] = csvData.map((row, i) => ({
            id: `kaggle_nfl_${i}`,
            sport: 'nfl' as const,
            name: `${row.team_home} vs ${row.team_away}`,
            start_time: row.schedule_date,
            status: 'finished',
            participants: [
                { id: `nfl_t_${row.team_home.toLowerCase().replace(/\s+/g, '_')}`, name: row.team_home, score: row.score_home },
                { id: `nfl_t_${row.team_away.toLowerCase().replace(/\s+/g, '_')}`, name: row.team_away, score: row.score_away }
            ],
            metadata: {
                spread: row.spread_favorite,
                stadium: row.stadium,
                weather: row.weather_detail
            }
        }));

        await DatasetVault.save('kaggle_nfl_historical', events);
        return events.length;
    }

    /**
     * Process Ultimate UFC Dataset
     * https://www.kaggle.com/datasets/mdabbert/ultimate-ufc-dataset
     */
    static async importUFCMetadata(fighters: any[]) {
        console.log(`[KAGGER IMPORTER] Processing UFC Fighter Metadata...`);

        const participants: Participant[] = fighters.map((f, i) => ({
            id: `ufc_p_${f.name.toLowerCase().replace(/\s+/g, '_')}`,
            name: f.name,
            type: 'individual' as const,
            sport: 'mma' as const,
            stats: {
                reach: f.reach,
                height: f.height,
                stance: f.stance,
                win_pct: f.win_pct
            },
            metadata: {
                source: 'kaggle_ultimate_ufc'
            }
        }));

        await DatasetVault.save('kaggle_ufc_fighters', participants);
        return participants.length;
    }
}
