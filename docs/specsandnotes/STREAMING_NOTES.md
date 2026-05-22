# Streaming Links - Important Information

## Current Status

The BetMax application now includes improved stream scrapers for multiple sources:
- Soccer-Free
- SportSurge  
- StreamEast
- NFLBite
- Sky Sports News
- And more...

## Known Issues & Limitations

### Why Some Streams Don't Play Directly

Many streaming sites use **anti-bot protection** including:
1. **Captcha verification** - Requires human interaction
2. **JavaScript challenges** - Dynamic content loading
3. **Cookie-based sessions** - Requires browser state
4. **Multi-step navigation** - Streams hidden behind multiple clicks

### What We've Done

✅ **Added Date/Time Display** - Events now show proper dates and times instead of generic text
✅ **Improved Timestamp Parsing** - Automatic parsing of time formats (15:00, 3:00 PM, etc.)
✅ **Fallback Stream Links** - Always provides the event page URL as a fallback option
✅ **Warning Indicators** - Streams that may require manual navigation show warning notes
✅ **iframe Detection** - Attempts to extract embedded players when available

### How to Use Streams

When you click on a stream link:

1. **Embedded Players** - If found, these should work directly in the app
2. **Manual Links** - Links marked with warnings will open in a new tab
3. **Captcha Required** - You may need to complete a captcha verification
4. **Multiple Attempts** - Try different stream options if one doesn't work

### Best Practices

- **Use "Watch on [Site] (Manual)" links** - These open the event page where you can navigate to streams
- **Disable ad blockers temporarily** - Some streams won't load with ad blockers active
- **Try multiple sources** - Different scrapers may have different success rates
- **Check event times** - Streams are only available when events are actually live

## Technical Details

### Stream Extraction Process

1. **Event Scraping** - Collects upcoming/live events from multiple sources
2. **Stream Detection** - Looks for:
   - iframe embeds with player URLs
   - Direct stream links
   - Event page URLs as fallbacks
3. **Metadata Collection** - Quality, language, mobile support, ad count
4. **Fallback Handling** - Always returns at least the event page URL

### Timestamp Parsing

Events now support:
- ISO date strings (2026-01-26T15:00:00Z)
- Time-only formats (15:00, 3:00 PM)
- Relative times (Today, Tomorrow)
- Descriptive text (Live Now, Upcoming)

## Future Improvements

Potential enhancements:
- [ ] Browser automation for captcha handling
- [ ] User session management for authenticated streams
- [ ] Stream quality verification
- [ ] Automatic stream health checking
- [ ] User feedback on working streams

## Support

If streams aren't working:
1. Check if the event is actually live
2. Try opening the link in a new tab manually
3. Verify your internet connection
4. Try a different stream source
5. Check the source website directly

---

**Note**: These streaming sites frequently change their structure and protection mechanisms. The scrapers are designed to be resilient but may require updates as sites evolve.
