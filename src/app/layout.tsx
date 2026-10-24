import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined,
  title: 'CreatorConnect AI | Commercial AI Content Creator Marketplace',
  description:
    'Discover, evaluate and commission verified generative AI directors, animators and technical artists with workflow evidence, commercial clearing, and structured briefs.',
  keywords: [
    'AI Content Creator',
    'AI Filmmakers',
    'Runway Gen-3',
    'Sora',
    'Midjourney',
    'ComfyUI',
    'Commercial Generative AI',
    'AI Video Production',
  ],
  authors: [{ name: 'CreatorConnect AI Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100 antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <Suspense fallback={<div className="h-16 bg-slate-950/80 border-b border-slate-800/80" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
