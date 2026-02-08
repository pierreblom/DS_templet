-- Migration: Add authentication fields to profiles table
-- Phase 1.2: Fix Customer Authentication Model
-- Add name column (display name)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS name VARCHAR(255);
-- Add password_hash column (nullable for OAuth users)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
-- Add role column with default 'customer'
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer' NOT NULL;
-- Add constraint to ensure role is either 'customer' or 'admin'
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_role_check'
) THEN
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'admin'));
END IF;
END $$;
-- Add comments for documentation
COMMENT ON COLUMN profiles.name IS 'Display name for the user';
COMMENT ON COLUMN profiles.password_hash IS 'Bcrypt hashed password, nullable for Google OAuth users';
COMMENT ON COLUMN profiles.role IS 'User role: customer or admin';