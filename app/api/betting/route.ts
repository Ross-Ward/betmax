import { NextResponse } from 'next/server';
import { getBettingEvents } from '@/lib/scrapers';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const data = await getBettingEvents();
        return NextResponse.json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        console.error('API Betting Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch betting data'
        }, { status: 500 });
    }
}
