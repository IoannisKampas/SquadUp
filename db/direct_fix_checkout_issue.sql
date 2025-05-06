-- Check if the orders table has a customer_id column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'customer_id'
    ) THEN
        -- Add customer_id column if it doesn't exist
        ALTER TABLE orders ADD COLUMN customer_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Added customer_id column to orders table';
    ELSE
        RAISE NOTICE 'customer_id column already exists in orders table';
    END IF;
END $$;

-- Drop all triggers on the orders table
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'orders'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_rec.trigger_name || ' ON orders;';
        RAISE NOTICE 'Dropped trigger % on orders table', trigger_rec.trigger_name;
    END LOOP;
END $$;

-- Fix the update_chat_rooms_updated_at function
CREATE OR REPLACE FUNCTION update_chat_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_rooms
    SET updated_at = NOW()
    WHERE id = NEW.chat_room_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check for any functions that reference player_id
DO $$
DECLARE
    func_rec RECORD;
    func_def TEXT;
    updated_def TEXT;
BEGIN
    FOR func_rec IN
        SELECT 
            p.proname as function_name,
            pg_get_functiondef(p.oid) as function_definition
        FROM 
            pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE 
            n.nspname = 'public' AND
            pg_get_functiondef(p.oid) LIKE '%player_id%'
    LOOP
        func_def := func_rec.function_definition;
        updated_def := replace(func_def, 'player_id', 'customer_id');
        
        -- Execute the updated function definition
        EXECUTE updated_def;
        
        RAISE NOTICE 'Updated function % to use customer_id instead of player_id', func_rec.function_name;
    END LOOP;
END $$;
