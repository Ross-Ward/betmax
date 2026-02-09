import { NextResponse } from 'next/server';
import { DataIntelligence } from '@/lib/data/intelligence';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ name: string }> }
) {
    const { name } = await params;
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || undefined;

    try {
        const data = await DataIntelligence.getSportsData(name, season);

        if (!data) {
            return NextResponse.json({ error: 'Data could not be retrieved from intelligence vault.' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (e) {
        console.error('API Dataset Error:', e);
        return NextResponse.json({ error: 'Scraper failed or timed out.' }, { status: 500 });
    }
}
