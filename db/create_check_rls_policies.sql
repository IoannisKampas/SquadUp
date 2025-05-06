-- Function to check RLS policies on the orders table
CREATE OR REPLACE FUNCTION check_orders_rls_policies()
RETURNS TABLE (
  policy_name TEXT,
  policy_definition TEXT,
  policy_roles TEXT[]
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.policyname::TEXT,
    pg_get_expr(p.qual, p.polrelid)::TEXT as policy_definition,
    p.polroles::TEXT[]
  FROM 
    pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
  WHERE 
    c.relname = 'orders';
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_orders_rls_policies() TO authenticated;
