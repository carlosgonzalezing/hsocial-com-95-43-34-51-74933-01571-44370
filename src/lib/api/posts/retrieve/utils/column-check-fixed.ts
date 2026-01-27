import { checkColumnExists as simpleCheckColumnExists } from "./simple-column-check";

export async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  return simpleCheckColumnExists(tableName, columnName);
}
