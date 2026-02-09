/**
 * Test script for all stream scrapers
 * Run with: npm run test-scrapers or node --loader ts-node/esm test-scrapers.ts
 */

import { getAggregatedEvents, getEventStreams } from './index';

async function testScrapers() {
    console.log('='.repeat(80));
    console.log('TESTING ALL STREAM SCRAPERS');
    console.log('='.repeat(80));
    console.log('');

    try {
        console.log('📡 Fetching events from all sources...');
        console.log('');

        const startTime = Date.now();
        const events = await getAggregatedEvents();
        const endTime = Date.now();

        console.log('');
        console.log('='.repeat(80));
        console.log('RESULTS SUMMARY');
        console.log('='.repeat(80));
        console.log(`Total events found: ${events.length}`);
        console.log(`Time taken: ${((endTime - startTime) / 1000).toFixed(2)}s`);
        console.log('');

        // Group events by source
        const eventsBySource: Record<string, any[]> = {};
        events.forEach(event => {
            const source = event.source || 'Unknown';
            if (!eventsBySource[source]) {
                eventsBySource[source] = [];
            }
            eventsBySource[source].push(event);
        });

        // Display breakdown by source
        console.log('Events by Source:');
        console.log('-'.repeat(80));
        Object.entries(eventsBySource).forEach(([source, sourceEvents]) => {
            console.log(`  ${source}: ${sourceEvents.length} events`);
        });
        console.log('');

        // Display sample events from each source
        console.log('Sample Events:');
        console.log('-'.repeat(80));
        Object.entries(eventsBySource).forEach(([source, sourceEvents]) => {
            console.log(`\n📺 ${source}:`);
            sourceEvents.slice(0, 3).forEach((event, index) => {
                console.log(`  ${index + 1}. ${event.name}`);
                console.log(`     Sport: ${event.sport_title}`);
                console.log(`     Time: ${event.commence_time}`);
                console.log(`     URL: ${event.url}`);
                if (event.images && event.images.length > 0) {
                    console.log(`     Images: ${event.images.length} found`);
                }
            });
        });

        // Test stream extraction for first event with URL
        console.log('');
        console.log('='.repeat(80));
        console.log('TESTING STREAM EXTRACTION');
        console.log('='.repeat(80));

        const eventWithUrl = events.find(e => e.url);
        if (eventWithUrl) {
            console.log(`\nTesting stream extraction for: ${eventWithUrl.name}`);
            console.log(`URL: ${eventWithUrl.url}`);
            console.log('');

            try {
                const streams = await getEventStreams(eventWithUrl.url!);
                console.log(`✅ Found ${streams.length} streams`);

                if (streams.length > 0) {
                    console.log('\nSample Streams:');
                    streams.slice(0, 3).forEach((stream, index) => {
                        console.log(`  ${index + 1}. ${stream.link_name}`);
                        console.log(`     Quality: ${stream.quality}`);
                        console.log(`     Language: ${stream.language}`);
                        console.log(`     Ads: ${stream.ads}`);
                        console.log(`     Mobile: ${stream.mobile}`);
                    });
                }
            } catch (error) {
                console.error(`❌ Stream extraction failed:`, error);
            }
        } else {
            console.log('⚠️  No events with URLs found to test stream extraction');
        }

        console.log('');
        console.log('='.repeat(80));
        console.log('TEST COMPLETE');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('❌ Test failed with error:', error);
        process.exit(1);
    }
}

// Run the test
testScrapers().then(() => {
    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
}).catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
});
