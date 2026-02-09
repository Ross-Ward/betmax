import { NextResponse } from 'next/server';
import { DatasetOrchestrator } from '@/lib/data/dataset-orchestrator';
import { DatasetVault } from '@/lib/data/dataset-vault';

export const dynamic = 'force-dynamic';

export async function GET() {
    // Return current status of datasets
    const datasets = await DatasetVault.list();
    return NextResponse.json({
        active_datasets: datasets,
        status: 'system_ready'
    });
}

export async function POST() {
    // Trigger a full update - this is a long-running task
    // In a real app, this would be a background job (BullMQ, etc.)
    // For now, we trigger it and log progress

    console.log('[API] Triggering dataset update...');

    // We don't await this if we want to return immediately, 
    // but for debugging/confirmation we can await or use a promise chain
    DatasetOrchestrator.updateAll().then(() => {
        console.log('[API] Dataset update finished.');
    }).catch(err => {
        console.error('[API] Dataset update failed:', err);
    });

    return NextResponse.json({
        success: true,
        message: 'Dataset update initiated in background.'
    });
}
