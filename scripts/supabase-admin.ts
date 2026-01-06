import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/integrations/supabase/types';
import { config } from 'dotenv';

// Cargar variables de entorno desde .env
config({ path: '.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase admin environment variables');
}

// Cliente admin: bypassea RLS, puede crear usuarios e insertar directamente
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
