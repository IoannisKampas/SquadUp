-- Add is_head_admin column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'is_head_admin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_head_admin BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
