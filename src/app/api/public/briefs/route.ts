import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/client';
import { getAllBriefs, createBrief } from '@/lib/store';
import { creativeBriefSchema } from '@/lib/validations';
import { CreativeBrief } from '@/types';

export async function GET() {
  const supabase = createAdminClient() || createClient();
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Zod Validation
    const parsed = creativeBriefSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const briefData = parsed.data;
    const brandId = (body.brand_id as string) || 'brand-nike-demo';
    const status = (body.status as 'draft' | 'published' | 'closed') || 'published';

    // 2. Persist to Supabase when configured
    const supabase = createAdminClient() || createClient();
    if (supabase) {
      try {
        let resolvedBrandId = brandId;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(resolvedBrandId);

        if (!isUUID) {
          // If using a demo persona string ID, resolve to an existing brand profile in Supabase to fulfill FK
          const { data: brandProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'brand')
            .limit(1)
            .single();

          if (brandProfile?.id) {
            resolvedBrandId = brandProfile.id;
          } else {
            const { data: anyProfile } = await supabase
              .from('profiles')
              .select('id')
              .limit(1)
              .single();
            if (anyProfile?.id) {
              resolvedBrandId = anyProfile.id;
            }
          }
        }

        const insertPayload = {
          ...briefData,
          brand_id: resolvedBrandId,
          status,
          deadline: new Date(briefData.deadline).toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: inserted, error: dbError } = await supabase
          .from('briefs')
          .insert(insertPayload)
          .select()
          .single();

        if (!dbError && inserted) {
          // Sync in-memory store so server routes have it immediately
          createBrief(inserted as CreativeBrief);
          return NextResponse.json(
            { success: true, brief: inserted, id: inserted.id },
            { status: 201 }
          );
        } else if (dbError) {
          console.error('Supabase briefs insert error:', dbError.message);
        }
      } catch (err) {
        console.error('Unexpected error inserting brief into Supabase:', err);
      }
    }

    // 3. Fallback to in-memory store if Supabase is unavailable or failed
    const localBrief = createBrief({
      ...briefData,
      brand_id: brandId,
      status,
    });

    return NextResponse.json(
      { success: true, brief: localBrief, id: localBrief.id },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error handling POST /api/public/briefs:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

