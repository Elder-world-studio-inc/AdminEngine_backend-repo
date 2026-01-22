
-- Add division_id column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS division_id TEXT;

-- Update Division Name in Users
UPDATE users SET division_id = 'interactive' WHERE division_id = 'wayfarer' OR role = 'wayfarer'; -- 'wayfarer' might be in role if division_id was missing
UPDATE users SET role = 'division' WHERE role = 'wayfarer'; -- Normalize role to 'division' if it was 'wayfarer'
UPDATE users SET division_id = 'interactive' WHERE username = 'interactive' OR username = 'wayfarer';

-- Rename user 'wayfarer' to 'interactive'
UPDATE users SET username = 'interactive', email = 'interactive@elderworlds.com' WHERE username = 'wayfarer';

-- Update Assets Division
UPDATE assets SET division_id = 'interactive' WHERE division_id = 'wayfarer';
