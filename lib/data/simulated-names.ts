export const REAL_TEAM_NAMES: Record<string, string[]> = {
    soccer: [
        'Manchester City', 'Liverpool', 'Arsenal', 'Aston Villa', 'Tottenham',
        'Manchester United', 'Newcastle', 'Brighton', 'West Ham', 'Chelsea',
        'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Girona', 'Athletic Bilbao',
        'Bayern Munich', 'Bayer Leverkusen', 'Stuttgart', 'RB Leipzig', 'Borussia Dortmund',
        'Inter Milan', 'Juventus', 'AC Milan', 'Bologna', 'AS Roma',
        'PSG', 'Monaco', 'Brest', 'Lille', 'Nice'
    ],
    nba: [
        'Boston Celtics', 'Milwaukee Bucks', 'Philadelphia 76ers', 'Cleveland Cavaliers', 'New York Knicks',
        'Miami Heat', 'Indiana Pacers', 'Orlando Magic', 'Chicago Bulls', 'Atlanta Hawks',
        'Minnesota Timberwolves', 'OKC Thunder', 'Denver Nuggets', 'LA Clippers', 'Sacramento Kings',
        'Phoenix Suns', 'Dallas Mavericks', 'LA Lakers', 'Golden State Warriors', 'Houston Rockets'
    ],
    nfl: [
        'Baltimore Ravens', 'Buffalo Bills', 'Kansas City Chiefs', 'Houston Texans', 'Cleveland Browns',
        'Miami Dolphins', 'Pittsburgh Steelers', 'San Francisco 49ers', 'Dallas Cowboys', 'Detroit Lions',
        'Philadelphia Eagles', 'LA Rams', 'Green Bay Packers', 'Tampa Bay Buccaneers'
    ],
    tennis: [
        'Novak Djokovic', 'Carlos Alcaraz', 'Daniil Medvedev', 'Jannik Sinner', 'Andrey Rublev',
        'Alexander Zverev', 'Stefanos Tsitsipas', 'Holger Rune', 'Hubert Hurkacz', 'Casper Ruud',
        'Iga Swiatek', 'Aryna Sabalenka', 'Coco Gauff', 'Elena Rybakina', 'Jessica Pegula'
    ],
    mma: [
        'Jon Jones', 'Islam Makhachev', 'Alex Pereira', 'Leon Edwards', 'Dustin Poirier',
        'Justin Gaethje', 'Max Holloway', 'Charles Oliveira', 'Sean O\'Malley', 'Ilian Topuria'
    ]
};

export function getRealisticTeams(sportKey: string): [string, string] {
    const key = sportKey.toLowerCase();
    let names = REAL_TEAM_NAMES.soccer;

    if (key.includes('nba') || key.includes('basketball')) names = REAL_TEAM_NAMES.nba;
    else if (key.includes('nfl') || key.includes('football')) names = REAL_TEAM_NAMES.nfl;
    else if (key.includes('tenn')) names = REAL_TEAM_NAMES.tennis;
    else if (key.includes('mma') || key.includes('ufc')) names = REAL_TEAM_NAMES.mma;
    else if (key.includes('soccer')) names = REAL_TEAM_NAMES.soccer;

    const idx1 = Math.floor(Math.random() * names.length);
    let idx2 = Math.floor(Math.random() * names.length);
    while (idx1 === idx2) idx2 = Math.floor(Math.random() * names.length);

    return [names[idx1], names[idx2]];
}
