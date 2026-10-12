import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { getAllCreators } from '@/lib/store';

export async function GET() {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('verification_level', 'verified')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json(data);
      }
    } catch {
      // Fall through to local fallback
    }
  }

  // Local demo fallback: return verified creators from store/seed data
  const localCreators = getAllCreators().filter(
    (c) => c.verification_level === 'verified'
  );
  return NextResponse.json(localCreators);
}
