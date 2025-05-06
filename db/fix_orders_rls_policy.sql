-- Drop the existing policy
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."orders";

-- Create a new policy that allows pros to see pending orders with null pro_id
CREATE POLICY "Enable read access for all users" ON "public"."orders"
FOR SELECT
TO authenticated
USING (
  (auth.uid() = customer_id) OR 
  (auth.uid() = pro_id) OR 
  (EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.account_type = ANY (ARRAY['admin'::text, 'head_admin'::text])
  )) OR
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
