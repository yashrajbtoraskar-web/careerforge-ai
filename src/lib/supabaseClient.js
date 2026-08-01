import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// While no real Supabase project is connected yet, the app keeps running on
// localStorage (see StoreContext.jsx). Once VITE_SUPABASE_URL and
// VITE_SUPABASE_ANON_KEY are set in .env, `isSupabaseConfigured` flips to true
// and the app can be switched over to real database calls.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
