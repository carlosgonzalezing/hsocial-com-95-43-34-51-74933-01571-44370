
// Define Json types for Supabase's Json column type

export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

// Alias for the Json type used in Supabase
export type Json = JsonValue;
