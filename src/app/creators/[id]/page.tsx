import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCreatorById } from '@/lib/store';
import CreatorProfileClient from '@/components/CreatorProfileClient';



export default async function CreatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const creator = getCreatorById(id);

  if (!creator) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading creator profile…</div>}>
          <CreatorProfileClient creator={creator} />
        </Suspense>
      </div>
    </div>
  );
}


