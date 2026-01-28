#!/usr/bin/env python3
"""
Import Outscraper CSV into leads_raw table.
Usage: python3 scripts/import-leads-csv.py /path/to/file.csv
"""

import csv
import psycopg2
import re
import sys
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

def sanitize_column(col):
    """Convert CSV column name to valid SQL column name."""
    s = re.sub(r'[^a-zA-Z0-9]', '_', col)
    s = s.strip('_')
    s = re.sub(r'_+', '_', s)
    if s in ('type', 'range'):
        s = s + '_value'
    return s.lower()

def get_db_connection():
    """Get database connection from environment."""
    return psycopg2.connect(
        host="aws-1-us-east-2.pooler.supabase.com",
        port=6543,
        database="postgres",
        user="postgres.veeynxpptwxjuxitwyif",
        password=os.getenv('DATABASE_URL', '').split(':')[2].split('@')[0] if os.getenv('DATABASE_URL') else "xi27GXAoCOYk9KUQ"
    )

def import_csv(csv_path):
    """Import CSV file into leads_raw table."""
    conn = get_db_connection()
    cur = conn.cursor()

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        # Get sanitized column names
        db_columns = [sanitize_column(col) for col in reader.fieldnames]

        # Build INSERT statement
        columns_str = ', '.join(db_columns)
        placeholders = ', '.join(['%s'] * len(db_columns))
        insert_sql = f"INSERT INTO leads_raw ({columns_str}) VALUES ({placeholders})"

        batch = []
        total = 0
        batch_size = 100

        for row in reader:
            values = [row.get(col, '') or None for col in reader.fieldnames]
            batch.append(values)
            total += 1

            if len(batch) >= batch_size:
                cur.executemany(insert_sql, batch)
                conn.commit()
                print(f"Inserted {total} rows...")
                batch = []

        if batch:
            cur.executemany(insert_sql, batch)
            conn.commit()

        print(f"\n✅ Imported {total} rows total")

    cur.close()
    conn.close()
    return total

def clean_non_mobile(conn=None):
    """Remove non-mobile phone records."""
    should_close = False
    if conn is None:
        conn = get_db_connection()
        should_close = True

    cur = conn.cursor()
    cur.execute("""
        DELETE FROM leads_raw
        WHERE phone_phones_enricher_carrier_type IS NULL
           OR phone_phones_enricher_carrier_type != 'mobile'
    """)
    deleted = cur.rowcount
    conn.commit()
    cur.close()

    if should_close:
        conn.close()

    print(f"✅ Removed {deleted} non-mobile records")
    return deleted

def remove_duplicate_place_ids(conn=None):
    """Remove duplicate place_id records."""
    should_close = False
    if conn is None:
        conn = get_db_connection()
        should_close = True

    cur = conn.cursor()
    cur.execute("""
        DELETE FROM leads_raw a
        USING leads_raw b
        WHERE a.place_id = b.place_id
          AND a.place_id IS NOT NULL
          AND a.place_id != ''
          AND a.id > b.id
    """)
    deleted = cur.rowcount
    conn.commit()
    cur.close()

    if should_close:
        conn.close()

    print(f"✅ Removed {deleted} duplicate place_id records")
    return deleted

def get_stats():
    """Print current table stats."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT
          COUNT(*) as total,
          COUNT(NULLIF(site, '')) as has_website,
          COUNT(NULLIF(facebook, '')) as has_facebook,
          COUNT(NULLIF(city, '')) as has_city,
          COUNT(NULLIF(place_id, '')) as has_place_id
        FROM leads_raw
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()

    print(f"\n📊 Current Stats:")
    print(f"   Total: {row[0]}")
    print(f"   Has website: {row[1]}")
    print(f"   Has Facebook: {row[2]}")
    print(f"   Has city: {row[3]}")
    print(f"   Has place_id: {row[4]}")
    return row[0]

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 import-leads-csv.py <csv_path>")
        print("\nThis script imports a CSV and runs initial cleanup:")
        print("  1. Import CSV to leads_raw")
        print("  2. Remove non-mobile phone records")
        print("  3. Remove duplicate place_ids")
        print("\nAfter running, also run: python3 scripts/geocode-leads.py")
        sys.exit(1)

    csv_path = sys.argv[1]

    print(f"📥 Importing {csv_path}...")
    import_csv(csv_path)

    print(f"\n🧹 Cleaning data...")
    clean_non_mobile()
    remove_duplicate_place_ids()

    get_stats()

    print(f"\n⚠️  Next step: Run 'python3 scripts/geocode-leads.py' to fill missing addresses")
