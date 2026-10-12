import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { getAllBriefs } from '@/lib/store';

export async function GET() {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json(data);
      }
    } catch {
      // Fall through to local fallback
    }
  }

  // Local demo fallback: return published briefs from store/seed data
  const localBriefs = getAllBriefs().filter((b) => b.status === 'published');
  return NextResponse.json(localBriefs);
}
