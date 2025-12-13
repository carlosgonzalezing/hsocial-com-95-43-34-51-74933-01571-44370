import { supabase } from '@/integrations/supabase/client';

// Enhanced type workaround for Supabase queries when types are not properly generated
export const supabaseQuery = {
  // Helper to bypass strict typing for problematic queries
  insert: (table: string, data: any) => {
    return (supabase as any).from(table).insert(data);
  },
  
  select: (table: string, columns: string = '*') => {
    return (supabase as any).from(table).select(columns);
  },
  
  update: (table: string, data: any) => {
    return (supabase as any).from(table).update(data);
  },
  
  delete: (table: string) => {
    return (supabase as any).from(table).delete();
  },

  // Enhanced query builder with type bypass
  from: (table: string) => {
    return (supabase as any).from(table);
  },

  // Safe data access helper
  getData: (data: any) => {
    if (!data || typeof data === 'string') return null;
    if ('error' in data) return null;
    return data;
  },

  // Safe property access
  getProp: (obj: any, prop: string, defaultValue: any = null) => {
    if (!obj || typeof obj !== 'object') return defaultValue;
    if ('error' in obj) return defaultValue;
    return obj[prop] ?? defaultValue;
  }
};

// Set global supabase reference
if (typeof window !== 'undefined') {
  (globalThis as any).supabase = require('@/integrations/supabase/client').supabase;
}