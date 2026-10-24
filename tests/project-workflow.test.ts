import { describe, it, expect, beforeEach } from 'vitest';
import {
  createBrief,
  createInvitation,
  updateProjectWorkflowStatus,
  getInvitations,
} from '../src/lib/store';
import { ProjectStatus } from '../src/types';

describe('Project Workflow Lifecycle Tracking', () => {
  const brandId = 'test-brand-101';
  const creatorId = 'c1111111-1111-4111-8111-111111111111';
  let briefId: string;
  let invitationId: string;

  beforeEach(() => {
    const brief = createBrief({
      brand_id: brandId,
      brand_name: 'Test Athletics',
      title: 'Workflow Test Campaign Brief',
      campaign_goal: 'Test full lifecycle from invite to commercial approval.',
      description: 'Testing lifecycle transitions, deliverables, revisions, and audits.',
      target_audience: 'Testing audience',
      content_type: 'video',
      styles: ['Cinematic'],
      aspect_ratio: '16:9',
      deliverables_count: 1,
      intended_platforms: ['YouTube'],
      budget_min: 1000,
      budget_max: 2500,
      currency: 'USD',
      deadline: '2026-12-31',
      revision_rounds: 2,
      commercial_use_required: true,
      intended_usage_rights: 'paid_media',
      territory: 'Worldwide',
      license_duration: '1 year',
      exclusivity: 'Category exclusive',
      disclose_model_licensing: true,
      proof_of_tool_license_required: true,
      status: 'published',
    });
    briefId = brief.id;

    const inv = createInvitation(
      briefId,
      creatorId,
      brandId,
      'Invitation for commercial production'
    );
    invitationId = inv.id;
  });

  it('supports the complete happy-path lifecycle: invited -> accepted -> in_production -> delivered -> approved', () => {
    // 1. Initial status is invited
    let project = getInvitations({ brandId }).find((i) => i.id === invitationId)!;
    expect(project.status).toBe('invited');

    // 2. Creator accepts invitation
    project = updateProjectWorkflowStatus({
      projectId: invitationId,
      targetStatus: 'accepted',
      userId: creatorId,
      userRole: 'creator',
      note: 'Creator accepted campaign assignment',
    });
    expect(project.status).toBe('accepted');
    expect(project.responded_at).toBeDefined();

    // 3. Creator starts production
    project = updateProjectWorkflowStatus({
      projectId: invitationId,
      targetStatus: 'in_production',
      userId: creatorId,
      userRole: 'creator',
      note: 'Initiating prompt generation & camera passes in Runway',
    });
    expect(project.status).toBe('in_production');

    // 4. Creator submits deliverable
    project = updateProjectWorkflowStatus({
      projectId: invitationId,
      targetStatus: 'delivered',
      userId: creatorId,
      userRole: 'creator',
      deliverableUrl: '/videos/cyberpunk-pulse.mp4',
      deliverableNotes: 'Finished 4K render with color grade and prompt ledger included',
    });
    expect(project.status).toBe('delivered');
    expect(project.deliverable_url).toBe('/videos/cyberpunk-pulse.mp4');
    expect(project.delivered_at).toBeDefined();

    // 5. Brand approves deliverable
    project = updateProjectWorkflowStatus({
      projectId: invitationId,
      targetStatus: 'approved',
      userId: brandId,
      userRole: 'brand',
      note: 'Deliverable approved with full commercial digital advertising clearance',
    });
    expect(project.status).toBe('approved');
    expect(project.approved_at).toBeDefined();
    expect(project.history?.length).toBe(4);
  });

  it('supports the revision lifecycle: delivered -> revision_requested -> delivered -> approved', () => {
    // Progress to delivered
    updateProjectWorkflowStatus({
      projectId: invitationId,
      targetStatus: 'accepted',
      userId: creatorId,
      userRole: 'creator',
    });
    updateProjectWorkflowStatus({
      projectId: invitationId,
      targetStatus: 'in_production',
      userId: creatorId,
      userRole: 'creator',
    });
    updateProjectWorkflowStatus({
      projectId: invitationId,
      targetStatus: 'delivered',
      userId: creatorId,
      userRole: 'creator',
      deliverableUrl: '/videos/initial-cut.mp4',
    });

    // Brand requests revision with feedback
    let project = updateProjectWorkflowStatus({
      projectId: invitationId,
      targetStatus: 'revision_requested',
      userId: brandId,
      userRole: 'brand',
      revisionNotes: 'Please stabilize the camera motion in first 5 seconds and boost saturation.',
    });
    expect(project.status).toBe('revision_requested');
    expect(project.revision_notes).toContain('stabilize the camera motion');

    // Creator re-submits revised deliverable
    project = updateProjectWorkflowStatus({
      projectId: invitationId,
      targetStatus: 'delivered',
      userId: creatorId,
      userRole: 'creator',
      deliverableUrl: '/videos/revised-cut.mp4',
      deliverableNotes: 'Camera motion stabilized and color boosted per notes',
    });
    expect(project.status).toBe('delivered');
    expect(project.deliverable_url).toBe('/videos/revised-cut.mp4');

    // Brand approves final deliverable
    project = updateProjectWorkflowStatus({
      projectId: invitationId,
      targetStatus: 'approved',
      userId: brandId,
      userRole: 'brand',
      note: 'Revisions verified and approved',
    });
    expect(project.status).toBe('approved');
  });

  it('enforces role-based permissions and blocks unauthorized transitions', () => {
    // Creator cannot directly approve their own work
    expect(() => {
      updateProjectWorkflowStatus({
        projectId: invitationId,
        targetStatus: 'approved',
        userId: creatorId,
        userRole: 'creator',
      });
    }).toThrow(/Creators cannot transition/);

    // Brand cannot start production for the creator
    expect(() => {
      updateProjectWorkflowStatus({
        projectId: invitationId,
        targetStatus: 'in_production',
        userId: brandId,
        userRole: 'brand',
      });
    }).toThrow(/Brands cannot transition/);
  });
});
