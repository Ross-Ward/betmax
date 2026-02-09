import { NextResponse } from 'next/server';
import { getRecommendedEvents } from '@/lib/scrapers/oddsportal-scraper';
import { scrapeOddspedia } from '@/lib/scrapers/oddspedia-scraper';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');

    let data = [];

    if (source === 'oddspedia') {
        data = await scrapeOddspedia();
    } else {
        data = await getRecommendedEvents();
    }

    return NextResponse.json({
        success: true,
        count: data.length,
        data
    });
}
