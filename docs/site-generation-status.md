# Site Generation Status

## Scraping Complete (Jan 28, 2025)

| Data | Count | Status |
|------|-------|--------|
| Photos | 681/681 | ✅ Done |
| Reviews | 680/681 | ✅ Done |
| Facebook | 157/164 | ✅ Done |
| Screenshots | 46/327 | ❌ Skipped |

Scripts in `/scripts/`:
- `scrape-batch.ts` - Batch photos scraper (20 at a time)
- `scrape-reviews-fast.ts` - Batch reviews scraper (50 at a time)
- `generate-sites.ts` - Generate sites for all leads

## Template Status

Redesigned sections in `/src/components/sites/sections/`:
- Header - fixed nav, single CTA
- Hero - single CTA button (no duplicate phone)
- TrustBadges - removed fake "5-star" claim
- Services - icons only, no photos
- Reviews - dark theme
- ContactForm - new section (name, phone, message)
- ServiceArea - includes embedded map
- ChatWidget - floating chat bubble

**Still needs work:**
- Hero background image (currently generic stock)
- About section image
- Services - decide on icons vs stock photos
- Overall design quality improvements

## Processing Pipeline (NOT BUILT YET)

Planned steps for each site:
1. Logo & Brand Colors - review logo, extract colors
2. Hero Image - pick best photo from their gallery
3. Gallery Curation - select which photos to show
4. Review Selection - pick best reviews
5. Services - verify/customize service list
6. Content Polish - final tweaks
7. Approve - mark ready for outreach

## Database

- 681 active leads in `leads_raw`
- 681 sites generated in `sites` table
- Sites viewable at `/s/[slug]`
- Admin leads page at `/admin/leads`
