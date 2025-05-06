-- Check the structure of the notifications table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public';

-- Add a read column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'read' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN read BOOLEAN DEFAULT false;
    END IF;
END $$;
