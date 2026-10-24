import React, { Suspense } from 'react';
import { getBriefById } from '@/lib/store';
import { createClient, createAdminClient } from '@/lib/supabase/client';
import BriefDetailClient from '@/components/BriefDetailClient';
import { CreativeBrief } from '@/types';



export default async function BriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let brief: CreativeBrief | null = null;

  // 1. Query Supabase for the persisted brief record
  const supabase = createAdminClient() || createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        brief = data as CreativeBrief;
      }
    } catch (e) {
      console.error('Error fetching brief from Supabase:', e);
    }
  }

  // 2. Fall back to local/in-memory store
  if (!brief) {
    brief = getBriefById(id) || null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading brief…</div>}>
          <BriefDetailClient brief={brief} briefId={id} />
        </Suspense>
      </div>
    </div>
  );
}


