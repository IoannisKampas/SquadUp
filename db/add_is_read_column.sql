-- Check if the notifications table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
    ) THEN
        -- Check if is_read column already exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'notifications' 
            AND column_name = 'is_read'
        ) THEN
            -- Add is_read column as an alias for read
            ALTER TABLE public.notifications ADD COLUMN is_read BOOLEAN GENERATED ALWAYS AS (read) STORED;
            
            -- Add comment to explain this is an alias
            COMMENT ON COLUMN public.notifications.is_read IS 'Alias for the read column to maintain compatibility with code expecting is_read';
        END IF;
    END IF;
END
$$;
