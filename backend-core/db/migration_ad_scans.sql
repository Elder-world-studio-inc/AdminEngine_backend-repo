-- Create the ad_scans table to track user activity
CREATE TABLE IF NOT EXISTS ad_scans (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_data TEXT, -- Can be large, consider storing URL if using S3 later
  result JSONB,    -- Stores the OpenAI analysis result
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add scan_count and is_elite columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS scan_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_elite BOOLEAN DEFAULT FALSE;
