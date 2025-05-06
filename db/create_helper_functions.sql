-- Function to get all triggers in the database
CREATE OR REPLACE FUNCTION get_all_triggers()
RETURNS TABLE (
  trigger_name text,
  table_name text,
  trigger_timing text,
  trigger_event text,
  trigger_function text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tgname::text AS trigger_name,
    c.relname::text AS table_name,
    CASE WHEN t.tgtype & 16 = 16 THEN 'AFTER' ELSE 'BEFORE' END AS trigger_timing,
    CASE 
      WHEN t.tgtype & 2 = 2 THEN 'INSERT'
      WHEN t.tgtype & 4 = 4 THEN 'DELETE'
      WHEN t.tgtype & 8 = 8 THEN 'UPDATE'
      ELSE 'UNKNOWN'
    END AS trigger_event,
    p.proname::text AS trigger_function
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_proc p ON t.tgfoid = p.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public';
END;
$$ LANGUAGE plpgsql;

-- Function to get the definition of a function
CREATE OR REPLACE FUNCTION get_function_definition(function_name text)
RETURNS text AS $$
DECLARE
  func_def text;
BEGIN
  SELECT pg_get_functiondef(p.oid)
  INTO func_def
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE p.proname = function_name
  AND n.nspname = 'public';
  
  RETURN func_def;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a column exists in a table
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS boolean AS $$
DECLARE
  exists_bool boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = $1
    AND column_name = $2
  ) INTO exists_bool;
  
  RETURN exists_bool;
END;
$$ LANGUAGE plpgsql;

-- Function to get table structure
CREATE OR REPLACE FUNCTION get_table_structure(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable text,
  column_default text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::text,
    c.column_default::text
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
  AND c.table_name = $1
  ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql;
