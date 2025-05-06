-- Function to get pending orders bypassing RLS
CREATE OR REPLACE FUNCTION get_pending_orders()
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  status TEXT,
  customer_id UUID,
  pro_id UUID,
  game_id UUID,
  price NUMERIC,
  description TEXT,
  discord_username TEXT,
  session_date TIMESTAMPTZ,
  session_duration INTEGER
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.created_at,
    o.status,
    o.customer_id,
    o.pro_id,
    o.game_id,
    o.price,
    o.description,
    o.discord_username,
    o.session_date,
    o.session_duration
  FROM 
    orders o
  WHERE 
    o.status = 'pending' 
    AND o.pro_id IS NULL
  ORDER BY 
    o.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_pending_orders() TO authenticated;

-- Create a debug table to check RLS policies
CREATE TABLE IF NOT EXISTS rls_debug (
  id SERIAL PRIMARY KEY,
  table_name TEXT,
  policy_name TEXT,
  policy_definition TEXT
);

-- Insert orders table RLS policies for debugging
INSERT INTO rls_debug (table_name, policy_name, policy_definition)
SELECT 
  'orders',
  p.policyname,
  pg_get_expr(p.qual, p.polrelid) as policy_definition
FROM 
  pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
WHERE 
  c.relname = 'orders';
