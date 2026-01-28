
// Re-export checkColumnExists from simple version (no RPC dependency)
export { checkColumnExists } from './simple-column-check';

import { checkColumnExists as checkColumn } from './simple-column-check';

/**
 * Specifically checks if the 'shared_from' column exists in the 'posts' table
 * 
 * @returns Promise<boolean> True if the shared_from column exists, false otherwise
 */
export async function checkSharedFromColumn(): Promise<boolean> {
  return await checkColumn('posts', 'shared_from');
}
