# Greyhound Scraper Specification

## Website
**URL**: `https://www.sportinglife.com/greyhounds/racecards`
**Source Type**: Mixed (Server-rendered structure, Client-rendered details)

## Data Architecture & Datasets

### 1. Meetings (Leagues)
*   **Dataset Name**: `greyhound_meetings`
*   **Source URL**: `https://www.sportinglife.com/greyhounds/racecards`
*   **Data Type**: Schedule / League
*   **Update Frequency**: Daily
*   **Primary Key**: `meeting_id` (format: `YYYYMMDD_TRACK`, e.g., `20251227_oxford`)
*   **Fields**:
    *   `id` (string): Unique identifier
    *   `date` (dts): Date of meeting
    *   `track` (string): Track name (e.g., "Oxford")
    *   `url` (string): Link to meeting (if applicable, usually anchors)
    *   `race_ids` (string[]): List of race IDs in this meeting

### 2. Race Events (Fixtures/Results)
*   **Dataset Name**: `greyhound_races`
*   **Source URL**: `/greyhounds/racecards/{date}/{track}/racecard/{id}`
*   **Data Type**: Event
*   **Update Frequency**: Per Match (Live/Post-race)
*   **Primary Key**: `race_id` (e.g., `481784`)
*   **Fields**:
    *   `id` (string): Unique Race ID
    *   `meeting_id` (string): FK to Meetings
    *   `time` (string): Race time (e.g., "18:04")
    *   `grade` (string): Race grade (e.g., "A6", "OR3")
    *   `distance` (integer): Distance in meters (e.g., 450)
    *   `prize_pool` (string): Prize text (e.g., "1st £110, Others £40")
    *   `status` (enum): `SCHEDULED`, `FINISHED`
    *   `winning_time` (float): If finished (e.g., 27.81)

### 3. Runners (Dogs)
*   **Dataset Name**: `greyhound_runners`
*   **Source URL**: `/greyhounds/racecards/{date}/{track}/racecard/{id}` (Inside race page)
*   **Data Type**: Player Stats / Team Stats
*   **Update Frequency**: Per Match
*   **Primary Key**: `runner_id` (Combination of `race_id` + `trap`)
*   **Fields**:
    *   `race_id` (string): FK to Races
    *   `trap` (integer): Trap number (1-6)
    *   `dog_name` (string): Name of the dog
    *   `trainer` (string): Trainer name
    *   `odds` (string/float): Current odds or SP
    *   `form_last_5` (string): e.g., "1-2-1-6-3"
    *   `position` (integer): Finishing position (if result)
    *   `distance_beaten` (string): Distance from winner

## Extraction Strategy

### Technology
*   **Engine**: Puppeteer (via `BaseScraper`)
*   **Reasoning**: Detailed runner data and results are client-side rendered (React/Next.js hydration). Simple HTTP GET (`read_url_content`) fails to retrieve runner tables.

### Execution Flow
1.  **Initialize**: Launch Puppeteer with stealth plugin.
2.  **Catalog Meetings**:
    *   Navigate to `/greyhounds/racecards`.
    *   Parse meeting headers (Date/Track).
    *   Collect all Racecard URLs.
3.  **Process Races**:
    *   Iterate through Racecard URLs.
    *   **Rate Limiting**: Add delays (2-5s) between requests to avoid 429 blocks (observed during exploration).
    *   **Data Extraction**:
        *   Wait for `.RunnerTable` or equivalent container.
        *   Extract header info (Grade, Distance, Prizes).
        *   Extract runner rows (Trap, Name, Trainer, Form, Odds/Res).
4.  **Normalization**:
    *   Convert partial timestamps to ISO.
    *   Normalize `1st`, `2nd` etc. to integers.
    *   Link Runners to Races via IDs.

### Anti-Bot & Stability
*   **Issues**: Site returns 429 on aggressive concurrent requests.
*   **Mitigation**:
    *   Sequential processing of races.
    *   Randomized delays.
    *   User-Agent rotation (handled by `BaseScraper`).

### API findings
*   Direct API endpoints (`/api/greyhounds/...`) were probed and returned 404.
*   The site uses Hydration; data is likely in a `__NEXT_DATA__` script tag or fetched via obscure internal endpoints. Puppeteer evaluation is the most robust method for now.
