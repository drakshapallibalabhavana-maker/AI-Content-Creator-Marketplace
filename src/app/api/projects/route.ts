import { NextRequest, NextResponse } from 'next/server';
import { updateProjectWorkflowStatus, getInvitations } from '@/lib/store';
import { ProjectStatus, UserRole } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get('brandId') || undefined;
  const creatorId = searchParams.get('creatorId') || undefined;

  const projects = getInvitations({ brandId, creatorId });
  return NextResponse.json({ success: true, projects });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectId,
      targetStatus,
      userId,
      userRole,
      deliverableUrl,
      deliverableNotes,
      revisionNotes,
      note,
    } = body;

    if (!projectId || !targetStatus || !userRole) {
      return NextResponse.json(
        { success: false, error: 'projectId, targetStatus, and userRole are required.' },
        { status: 400 }
      );
    }

    // Role-based state machine transition validation
    if (userRole === 'creator') {
      const allowedTarget = ['accepted', 'declined', 'in_production', 'delivered'];
      if (!allowedTarget.includes(targetStatus)) {
        return NextResponse.json(
          {
            success: false,
            error: `Creators are not authorized to transition project status to "${targetStatus}".`,
          },
          { status: 403 }
        );
      }

      if (targetStatus === 'delivered' && !deliverableUrl && !deliverableNotes) {
        return NextResponse.json(
          {
            success: false,
            error: 'Submitting deliverables requires a deliverable URL or production asset notes.',
          },
          { status: 400 }
        );
      }
    }

    if (userRole === 'brand') {
      const allowedTarget = ['approved', 'revision_requested', 'cancelled'];
      if (!allowedTarget.includes(targetStatus)) {
        return NextResponse.json(
          {
            success: false,
            error: `Brands are not authorized to transition project status to "${targetStatus}".`,
          },
          { status: 403 }
        );
      }

      if (targetStatus === 'revision_requested' && (!revisionNotes || revisionNotes.trim().length < 5)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Requesting revisions requires constructive feedback notes (min 5 characters).',
          },
          { status: 400 }
        );
      }
    }

    const updated = updateProjectWorkflowStatus({
      projectId,
      targetStatus: targetStatus as ProjectStatus,
      userId: userId || 'auth-user',
      userRole: userRole as UserRole,
      deliverableUrl,
      deliverableNotes,
      revisionNotes,
      note,
    });

    return NextResponse.json({
      success: true,
      project: updated,
      message: `Project status successfully updated to ${targetStatus}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error updating project workflow status.' },
      { status: 400 }
    );
  }
}
