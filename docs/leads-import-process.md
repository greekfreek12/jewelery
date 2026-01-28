# Leads Import Process

Standard process for importing Outscraper CSV data into the `leads_raw` table.

## Prerequisites

- CSV file from Outscraper (Google Maps scrape)
- Database access (see `.env.local` for credentials)
- Google Maps API key for geocoding

## Import Steps

### Step 1: Upload CSV & Import to Database

```bash
# CSV should have these key columns:
# name, phone, place_id, latitude, longitude, city, state,
# rating, reviews, photos_count, facebook, instagram, logo, etc.

# Run Python import script (sanitizes column names automatically)
python3 scripts/import-leads-csv.py /path/to/file.csv
```

### Step 2: Remove Non-Mobile Phone Numbers

Only keep leads with mobile phones (better for SMS outreach, more likely to be decision-makers).

```sql
DELETE FROM leads_raw
WHERE phone_phones_enricher_carrier_type IS NULL
   OR phone_phones_enricher_carrier_type != 'mobile';
```

### Step 3: Remove Duplicate Place IDs

```sql
DELETE FROM leads_raw a
USING leads_raw b
WHERE a.place_id = b.place_id
  AND a.place_id IS NOT NULL
  AND a.place_id != ''
  AND a.id > b.id;
```

### Step 4: Reverse Geocode Missing Addresses

Fill in city/state/postal_code for records that have lat/lng but missing address data.

```bash
python3 scripts/geocode-leads.py
```

### Step 5: Remove Records Without Address

```sql
DELETE FROM leads_raw
WHERE city IS NULL OR city = ''
   OR state IS NULL OR state = '';
```

## Summary Queries

Check data quality after import:

```sql
-- Overall stats
SELECT
  COUNT(*) as total,
  COUNT(NULLIF(site, '')) as has_website,
  COUNT(NULLIF(facebook, '')) as has_facebook,
  COUNT(NULLIF(instagram, '')) as has_instagram,
  COUNT(NULLIF(logo, '')) as has_logo,
  COUNT(NULLIF(rating, '')) as has_rating,
  COUNT(NULLIF(place_id, '')) as has_place_id
FROM leads_raw;

-- By state
SELECT state, COUNT(*) as count
FROM leads_raw
GROUP BY state
ORDER BY count DESC;

-- Phone carrier breakdown
SELECT phone_phones_enricher_carrier_type, COUNT(*)
FROM leads_raw
GROUP BY phone_phones_enricher_carrier_type;
```

## Key Fields for Website Generation

| Field | Purpose | Fallback |
|-------|---------|----------|
| `name` | Business name | Required |
| `phone` | Contact number | Required |
| `city`, `state` | Location display | Required |
| `full_address` | Contact section | Use city/state |
| `rating`, `reviews` | Social proof | Hide section if missing |
| `place_id` | Fetch Google photos | Use logo or placeholder |
| `logo` | Header/branding | Generate initials |
| `facebook`, `instagram` | Social links | Hide if missing |
| `working_hours` | Hours display | Hide section if missing |

## Key Fields for Sales Outreach

| Field | Purpose |
|-------|---------|
| `phone_phones_enricher_carrier_type` | Mobile = decision maker |
| `site` | Do they have a website already? |
| `email_1`, `email_2`, `email_3` | Email outreach |
| `category`, `subtypes` | Business type for personalization |
| `rating`, `reviews` | Business health indicator |

### Step 6: Filter to Target Categories & Verified Businesses

Only keep leads that match your target market. For plumbing/septic cold outreach:

```sql
-- Remove unverified businesses (not Google verified)
DELETE FROM leads_raw
WHERE verified IS NULL OR verified != 'True';

-- Remove non-target categories
-- Keep: Plumber, Septic system service
DELETE FROM leads_raw
WHERE category NOT IN ('Plumber', 'Septic system service');
```

**Category Analysis (Jan 2025 import):**

| Category | Before Filter | After Verified Filter |
|----------|---------------|----------------------|
| Plumber | 781 | 656 |
| Septic system service | 86 | 81 |
| **Target Total** | **867** | **737** |

**Deleted Categories (989 leads):**
- Empty category: 160
- Handyman/Handyperson: 142
- HVAC contractor: 103
- Contractor/General contractor: 131
- Construction company: 61
- Electrician + electrical services: 34
- Air conditioning: 40
- Remodeler variations: 39
- 60+ misc categories: ~280

### Step 7: Remove Established Businesses

Businesses with 150+ reviews AND an existing website are too established - they don't need our service.

```sql
UPDATE leads_raw
SET status = 'archived',
    status_reason = 'established_business',
    status_updated_at = NOW()
WHERE CAST(NULLIF(reviews, '') AS NUMERIC) >= 150
AND site IS NOT NULL
AND TRIM(site) != ''
AND status = 'active';
```

**Why these filters:**
1. **Verified only** - Google-verified businesses are legitimate, active, and have claimed their listing
2. **Plumber/Septic only** - These are our target market for personalized websites. Other trades (HVAC, electrical) may be added later as separate campaigns
3. **No established businesses** - 150+ reviews with a website means they're already successful and won't need our service

## Lead Lifecycle (Soft Delete)

Leads are never hard-deleted. Instead, they're marked with a `status` column:

| Status | Meaning |
|--------|---------|
| `active` | Default. Shows in leads table, ready for outreach |
| `archived` | Removed from view. Not interested, bad data, etc. |
| `converted` | Became a paying customer |

**Status reason examples:**
- `not_interested` - Declined offer
- `wrong_number` - Phone disconnected or wrong person
- `has_website` - Already has a good website
- `duplicate` - Same business, different listing
- `out_of_business` - Business closed
- `manual` - Manually removed without specific reason

**Why soft delete?**
1. **Analytics** - Track conversion rates, rejection reasons
2. **Deduplication** - When importing new leads, match against archived ones to avoid re-contacting
3. **Audit trail** - Know who was contacted and when
4. **Recovery** - Can restore accidentally archived leads

**Schema:**
```sql
status TEXT DEFAULT 'active',        -- active, archived, converted
status_reason TEXT,                   -- why status changed
status_updated_at TIMESTAMPTZ         -- when status changed
```

## Automation Notes

When running as an agent:
1. Place CSV in project root
2. Run: "Import the CSV at [path] into leads_raw following the standard process"
3. Agent will execute all 6 steps and report final count
