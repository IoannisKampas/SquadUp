-- Drop existing RLS policies on orders table
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON orders;
DROP POLICY IF EXISTS "Enable update for users based on role" ON orders;
DROP POLICY IF EXISTS "Enable delete for admins only" ON orders;

-- Create proper RLS policies
-- Allow all authenticated users to read orders
CREATE POLICY "Allow all users to read orders"
ON orders FOR SELECT
TO authenticated
USING (true);

-- Allow customers to create orders
CREATE POLICY "Allow customers to create orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = customer_id);

-- Allow pros to update orders they're assigned to
CREATE POLICY "Allow pros to update their orders"
ON orders FOR UPDATE
TO authenticated
USING (
  auth.uid() = pro_id OR 
  (pro_id IS NULL AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_pro = true
  ))
)
WITH CHECK (
  auth.uid() = pro_id OR 
  (pro_id IS NULL AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_pro = true
  ))
);

-- Allow customers to update their own orders
CREATE POLICY "Allow customers to update their orders"
ON orders FOR UPDATE
TO authenticated
USING (auth.uid() = customer_id)
WITH CHECK (auth.uid() = customer_id);

-- Allow admins to do anything
CREATE POLICY "Allow admins full access"
ON orders
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
