-- Add reviews_link to sites table
ALTER TABLE sites ADD COLUMN IF NOT EXISTS reviews_link TEXT;
