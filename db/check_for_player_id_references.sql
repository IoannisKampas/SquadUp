-- Function to check for player_id references in triggers
CREATE OR REPLACE FUNCTION check_for_player_id_references()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB = '[]'::JSONB;
  trigger_record RECORD;
  function_record RECORD;
  trigger_definition TEXT;
  function_definition TEXT;
BEGIN
  -- Check triggers
  FOR trigger_record IN 
    SELECT 
      t.tgname AS trigger_name,
      n.nspname AS schema_name,
      c.relname AS table_name,
      p.proname AS function_name
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    JOIN pg_proc p ON t.tgfoid = p.oid
  LOOP
    -- Get trigger function definition
    SELECT pg_get_functiondef(p.oid) INTO function_definition
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = trigger_record.function_name
    AND n.nspname = trigger_record.schema_name;
    
    -- Check if function definition contains 'player_id'
    IF function_definition LIKE '%player_id%' THEN
      result = result || jsonb_build_object(
        'type', 'trigger',
        'name', trigger_record.trigger_name,
        'schema', trigger_record.schema_name,
        'table', trigger_record.table_name,
        'function', trigger_record.function_name,
        'definition', function_definition
      );
    END IF;
  END LOOP;
  
  -- Check functions (excluding trigger functions already checked)
  FOR function_record IN 
    SELECT 
      p.proname AS function_name,
      n.nspname AS schema_name,
      pg_get_functiondef(p.oid) AS definition
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  LOOP
    -- Check if function definition contains 'player_id'
    IF function_record.definition LIKE '%player_id%' THEN
      result = result || jsonb_build_object(
        'type', 'function',
        'name', function_record.function_name,
        'schema', function_record.schema_name,
        'definition', function_record.definition
      );
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$;
