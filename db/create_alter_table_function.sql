-- Create a function to add columns to tables
CREATE OR REPLACE FUNCTION alter_table_add_column(
  table_name text,
  column_name text,
  column_type text,
  column_default text
) RETURNS void AS $$
DECLARE
  column_exists boolean;
  alter_statement text;
BEGIN
  -- Check if column exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = alter_table_add_column.table_name
    AND column_name = alter_table_add_column.column_name
  ) INTO column_exists;
  
  -- If column doesn't exist, add it
  IF NOT column_exists THEN
    alter_statement := 'ALTER TABLE ' || quote_ident(table_name) || 
                       ' ADD COLUMN ' || quote_ident(column_name) || ' ' || column_type;
    
    -- Add default if provided
    IF column_default IS NOT NULL THEN
      alter_statement := alter_statement || ' DEFAULT ' || column_default;
    END IF;
    
    EXECUTE alter_statement;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
