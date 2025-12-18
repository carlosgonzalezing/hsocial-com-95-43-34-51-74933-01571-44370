
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a column exists in a specified table
 * 
 * @param tableName The name of the table to check
 * @param columnName The name of the column to check for
 * @returns Promise<boolean> True if the column exists, false otherwise
 */
export async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    // Use raw SQL to check column existence in information_schema
    const { data, error } = await supabase.rpc(
      'check_column_exists',
      {
        table_name: tableName,
        column_name: columnName
      }
    );
      
    if (error) {
      console.error("Error checking column existence:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking column existence:", error);
    return false;
  }
}

/**
 * Specifically checks if the 'shared_from' column exists in the 'posts' table
 * 
 * @returns Promise<boolean> True if the shared_from column exists, false otherwise
 */
export async function checkSharedFromColumn(): Promise<boolean> {
  return await checkColumnExists('posts', 'shared_from');
}
