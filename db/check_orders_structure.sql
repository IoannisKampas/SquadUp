SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM 
    pg_constraint 
WHERE 
    conrelid = 'public.orders'::regclass
ORDER BY 
    contype, conname;
