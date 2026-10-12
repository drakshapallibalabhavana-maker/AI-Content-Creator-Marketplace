import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getBriefById } from '@/lib/store';
import BriefDetailClient from '@/components/BriefDetailClient';

export const instant = false;

export default async function BriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brief = getBriefById(id);

  if (!brief) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading brief…</div>}>
          <BriefDetailClient brief={brief} />
        </Suspense>
      </div>
    </div>
  );
}


