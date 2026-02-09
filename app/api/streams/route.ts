import { NextRequest, NextResponse } from 'next/server';
import { getEventStreams } from '@/lib/scrapers';


export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    try {
        // Import timeout utility
        const { withTimeout } = await import('@/lib/scrapers/scraper-utils');

        // Add 20s timeout to stream scraping
        const streams = await withTimeout(
            getEventStreams(url),
            20000,
            'Stream scraping timeout'
        );

        return NextResponse.json({ streams });
    } catch (error) {
        console.error('API Stream Scrape Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch streams',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
