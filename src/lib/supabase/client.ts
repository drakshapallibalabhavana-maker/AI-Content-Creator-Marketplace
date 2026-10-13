import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // If using placeholder or missing values, create safe dummy/mock client
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseUrl.includes('mock-demo')) {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('your-project') || supabaseUrl.includes('mock-demo')) {
    return null;
  }

  return createBrowserClient(supabaseUrl, serviceKey);
}
