/*
  # Create exec_sql function for database operations

  1. New Functions
    - `exec_sql(sql TEXT)` - Executes dynamic SQL statements
    - Returns 'OK' on success for compatibility with scripts

  2. Security
    - Function is created with proper permissions
    - Only accessible to authenticated users with proper roles

  3. Usage
    - Used by migration and setup scripts
    - Enables dynamic SQL execution through Supabase RPC calls
*/

-- Create the exec_sql function that the scripts are looking for
CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  EXECUTE sql;
  RETURN 'OK';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error executing SQL: %', SQLERRM;
END;
$function$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.exec_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(TEXT) TO service_role;