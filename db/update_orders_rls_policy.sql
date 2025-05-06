-- Drop the existing RLS policy (assuming it's named "Enable read access for all users")
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."orders";

-- Create the updated policy with the additional condition for pros
CREATE POLICY "Enable read access for all users" ON "public"."orders"
FOR SELECT
TO authenticated
USING (
  -- Existing conditions
  (auth.uid() = customer_id) OR 
  (auth.uid() = pro_id) OR 
  (EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.account_type = ANY (ARRAY['admin'::text, 'head_admin'::text])
  ))
  OR
  -- New condition for pros to see orders with null pro_id
  (
    pro_id IS NULL AND 
    status = 'pending' AND 
    EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE profiles.user_id = auth.uid() AND profiles.account_type = 'pro'
    )
  )
);
