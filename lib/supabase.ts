import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  const prefixes = ['', 'VITE_', 'PUBLIC_', 'NEXT_PUBLIC_'];
  
  try {
    const envSources = [
      (window as any).process?.env,
      (import.meta as any).env,
      (window as any).env
    ];

    for (const source of envSources) {
      if (!source) continue;
      for (const prefix of prefixes) {
        const value = source[prefix + key];
        if (value) return value;
      }
    }
  } catch (e) {}
  return '';
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.warn("Supabase not detected. Using Local Storage fallback.");
}