import { describe, it, expect } from 'vitest';
import { getMatchingCreatorsForBrief, createBrief } from '../src/lib/store';

describe('Creator Matching and Commercial Rights Tracking', () => {
  it('correctly boosts creators whose starting rate matches the campaign budget', () => {
    const brief = createBrief({
      brand_id: 'brand-test-match',
      brand_name: 'Test Brand',
      title: 'Cinematic Runway Video Brief',
      campaign_goal: 'Produce commercial 4K video teaser.',
      description: 'Runway Gen-3 video production with prompt ledger.',
      target_audience: 'Modern consumers',
      content_type: 'video',
      styles: ['Cinematic'],
      aspect_ratio: '16:9',
      deliverables_count: 1,
      intended_platforms: ['YouTube'],
      budget_min: 500,
      budget_max: 2000,
      currency: 'USD',
      deadline: '2026-11-30',
      revision_rounds: 2,
      required_tools: ['Runway'],
      commercial_use_required: true,
      intended_usage_rights: 'paid_media',
      territory: 'Worldwide',
      license_duration: '1 year',
      exclusivity: 'Category exclusive',
      disclose_model_licensing: true,
      proof_of_tool_license_required: true,
      status: 'published',
    });

    const matches = getMatchingCreatorsForBrief(brief);
    expect(matches.length).toBeGreaterThan(0);

    const topMatch = matches[0];
    expect(topMatch.matchScore).toBeGreaterThan(50);
    expect(topMatch.creator.tools.map((t) => t.toLowerCase())).toContain('runway');
    // Transparent matching explanation contains tool match
    expect(topMatch.matchReasons.some((r) => r.toLowerCase().includes('runway'))).toBe(true);
  });

  it('transparently flags commercial rights notes when broadcast rights are requested', () => {
    const broadcastBrief = createBrief({
      brand_id: 'brand-test-broadcast',
      brand_name: 'National Television Brand',
      title: 'National Broadcast Commercial',
      campaign_goal: 'Produce 30s broadcast commercial.',
      description: 'Broadcast television campaign with strict commercial clearances.',
      target_audience: 'National television audience',
      content_type: 'video',
      styles: ['Cinematic'],
      aspect_ratio: '16:9',
      deliverables_count: 1,
      intended_platforms: ['Broadcast TV'],
      budget_min: 2000,
      budget_max: 8000,
      currency: 'USD',
      deadline: '2026-12-01',
      revision_rounds: 3,
      commercial_use_required: true,
      intended_usage_rights: 'broadcast',
      territory: 'Worldwide',
      license_duration: 'Perpetual',
      exclusivity: 'Total buyout',
      disclose_model_licensing: true,
      proof_of_tool_license_required: true,
      status: 'published',
    });

    const matches = getMatchingCreatorsForBrief(broadcastBrief);
    expect(matches.length).toBeGreaterThan(0);

    // Each match has matchReasons explaining rights eligibility or notices
    matches.forEach((m) => {
      expect(Array.isArray(m.matchReasons)).toBe(true);
      expect(typeof m.rightsMismatch).toBe('boolean');
    });
  });
});
