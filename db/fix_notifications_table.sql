-- Check if is_read column exists and read column doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'is_read' 
        AND table_schema = 'public'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'read' 
        AND table_schema = 'public'
    ) THEN
        -- Rename is_read to read
        ALTER TABLE public.notifications RENAME COLUMN is_read TO read;
    ELSIF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'read' 
        AND table_schema = 'public'
    ) THEN
        -- Add read column
        ALTER TABLE public.notifications ADD COLUMN read BOOLEAN DEFAULT false;
    END IF;
END $$;
