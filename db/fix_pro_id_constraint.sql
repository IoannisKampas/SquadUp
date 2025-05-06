-- Drop the existing constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_pro_id_fkey;

-- Add a new constraint that allows NULL values
ALTER TABLE orders ADD CONSTRAINT orders_pro_id_fkey 
FOREIGN KEY (pro_id) REFERENCES profiles(id) DEFERRABLE INITIALLY DEFERRED;

-- Make sure the pro_id column allows NULL values
ALTER TABLE orders ALTER COLUMN pro_id DROP NOT NULL;
