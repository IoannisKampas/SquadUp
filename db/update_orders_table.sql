-- Add game_count column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'game_count'
    ) THEN
        ALTER TABLE orders ADD COLUMN game_count INTEGER DEFAULT 1;
    END IF;
END $$;

-- Add discord_username column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'discord_username'
    ) THEN
        ALTER TABLE orders ADD COLUMN discord_username TEXT;
    END IF;
END $$;

-- Add notes column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE orders ADD COLUMN notes TEXT;
    END IF;
END $$;
