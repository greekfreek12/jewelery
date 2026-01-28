#!/usr/bin/env python3
"""
Reverse geocode leads_raw records that have lat/lng but missing city/state.
Usage: python3 scripts/geocode-leads.py
"""

import psycopg2
import requests
import time
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', 'AIzaSyBDjWDyepAZAzCK3p4FjkSE3PcJYGM9SQM')

def get_db_connection():
    """Get database connection."""
    return psycopg2.connect(
        host="aws-1-us-east-2.pooler.supabase.com",
        port=6543,
        database="postgres",
        user="postgres.veeynxpptwxjuxitwyif",
        password="xi27GXAoCOYk9KUQ"
    )

def geocode_missing():
    """Reverse geocode records missing city/state."""
    conn = get_db_connection()
    cur = conn.cursor()

    # Get records missing city but have lat/lng
    cur.execute("""
        SELECT id, latitude, longitude
        FROM leads_raw
        WHERE (city IS NULL OR city = '')
        AND latitude IS NOT NULL AND latitude != ''
        AND longitude IS NOT NULL AND longitude != ''
    """)
    rows = cur.fetchall()
    print(f"Found {len(rows)} records to geocode")

    if not rows:
        print("✅ No records need geocoding")
        return 0

    updated = 0
    errors = 0

    for i, (id, lat, lng) in enumerate(rows):
        try:
            url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={API_KEY}"
            resp = requests.get(url, timeout=10)
            data = resp.json()

            if data.get('status') == 'OK' and data.get('results'):
                result = data['results'][0]

                # Extract address components
                city = state = postal_code = street = None
                for comp in result.get('address_components', []):
                    types = comp.get('types', [])
                    if 'locality' in types:
                        city = comp['long_name']
                    elif 'administrative_area_level_1' in types:
                        state = comp['long_name']
                    elif 'postal_code' in types:
                        postal_code = comp['long_name']
                    elif 'route' in types:
                        street = comp['long_name']

                # Update record
                cur.execute("""
                    UPDATE leads_raw
                    SET city = COALESCE(%s, city),
                        state = COALESCE(%s, state),
                        postal_code = COALESCE(%s, postal_code),
                        street = COALESCE(%s, street),
                        full_address = COALESCE(%s, full_address)
                    WHERE id = %s
                """, (city, state, postal_code, street, result.get('formatted_address'), id))

                updated += 1
            else:
                errors += 1

            # Progress every 100
            if (i + 1) % 100 == 0:
                conn.commit()
                print(f"Processed {i+1}/{len(rows)} - Updated: {updated}, Errors: {errors}")

            # Rate limit: be conservative
            time.sleep(0.05)

        except Exception as e:
            errors += 1
            if errors < 5:
                print(f"Error on {id}: {e}")

    conn.commit()
    cur.close()
    conn.close()

    print(f"\n✅ Geocoding complete! Updated: {updated}, Errors: {errors}")
    return updated

def remove_without_address():
    """Remove records that still don't have city/state."""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        DELETE FROM leads_raw
        WHERE city IS NULL OR city = ''
           OR state IS NULL OR state = ''
    """)
    deleted = cur.rowcount
    conn.commit()
    cur.close()
    conn.close()

    print(f"✅ Removed {deleted} records without city/state")
    return deleted

def get_final_count():
    """Get final record count."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM leads_raw")
    count = cur.fetchone()[0]
    cur.close()
    conn.close()
    return count

if __name__ == '__main__':
    print("🌍 Starting reverse geocoding...")
    geocode_missing()

    print("\n🧹 Removing records without address...")
    remove_without_address()

    count = get_final_count()
    print(f"\n📊 Final count: {count} clean leads")
