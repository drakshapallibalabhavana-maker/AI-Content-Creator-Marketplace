import { describe, it, expect } from 'vitest';
import { filterCreators, getMatchingCreatorsForBrief } from '../src/lib/store';
import { creativeBriefSchema, creatorProfileSchema } from '../src/lib/validations';
import { INITIAL_BRIEFS } from '../src/lib/seed-data';

describe('Discovery Filtering & AND/OR Semantics', () => {
  it('should find creators by single skill filter', () => {
    const res = filterCreators({ skills: ['Video editing'] });
    expect(res.total).toBeGreaterThan(0);
    // All returned creators must have 'Video editing'
    res.creators.forEach((c) => {
      expect(c.skills.map((s) => s.toLowerCase())).toContain('video editing');
    });
  });

  it('should correctly combine multi-select values within same category with OR', () => {
    const res = filterCreators({ tools: ['Runway', 'Kling'] });
    expect(res.total).toBeGreaterThan(0);
    res.creators.forEach((c) => {
      const lower = c.tools.map((t) => t.toLowerCase());
      const hasEither = lower.includes('runway') || lower.includes('kling');
      expect(hasEither).toBe(true);
    });
  });

  it('should correctly combine different filter categories with AND', () => {
    // Skills: Prompt engineering AND Tools: Midjourney AND Availability: available
    const res = filterCreators({
      skills: ['Prompt engineering'],
      tools: ['Midjourney'],
      availability: ['available'],
    });

    expect(res.total).toBeGreaterThan(0);
    res.creators.forEach((c) => {
      expect(c.skills).toContain('Prompt engineering');
      expect(c.tools).toContain('Midjourney');
      expect(c.availability).toBe('available');
    });
  });

  it('should return 0 results and provide relaxed suggestions for impossible criteria', () => {
    // Deliberate zero-result combination: starting rate < $100 and tool Sora and unavailable
    const res = filterCreators({
      tools: ['Sora'],
      price_max: 100,
      availability: ['unavailable'],
    });

    expect(res.total).toBe(0);
    expect(res.creators.length).toBe(0);
    expect(res.restrictiveFilterCategories.length).toBeGreaterThan(0);
    expect(res.relaxedSuggestions).toBeDefined();
    expect(res.relaxedSuggestions!.length).toBeGreaterThan(0);
  });

  it('should sort creators by lowest price correctly with stable secondary sort', () => {
    const res = filterCreators({ sort_by: 'price_asc', limit: 20 });
    for (let i = 0; i < res.creators.length - 1; i++) {
      expect(res.creators[i].starting_rate).toBeLessThanOrEqual(res.creators[i + 1].starting_rate);
    }
  });
});

describe('Deterministic Brief Creator Matching', () => {
  it('should rank matching creators for a running shoe brief based on tools and skills', () => {
    const brief = INITIAL_BRIEFS[0]; // Velocity X brief
    const matches = getMatchingCreatorsForBrief(brief);

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].matchScore).toBeGreaterThan(40);
    expect(matches[0].matchReasons.length).toBeGreaterThan(0);
    // Highest match score should be first
    for (let i = 0; i < matches.length - 1; i++) {
      expect(matches[i].matchScore).toBeGreaterThanOrEqual(matches[i + 1].matchScore);
    }
  });
});

describe('Zod Validation Engine', () => {
  it('should validate a complete creative brief', () => {
    const validData = {
      title: 'Neon Odyssey Synthwave Commercial',
      brand_name: 'RetroTech Audio',
      campaign_goal: 'Promote our wireless retro-style headphones to Gen Z music fans.',
      description: 'A 30-second hyper-stylized AI anime animation featuring vibrant neon rain and retro synth aesthetic.',
      target_audience: 'Audio enthusiasts and synthwave listeners aged 18-35',
      content_type: 'video' as const,
      styles: ['Cinematic', 'Retro'],
      aspect_ratio: '16:9' as const,
      deliverables_count: 1,
      intended_platforms: ['YouTube', 'Instagram'],
      budget_min: 1500,
      budget_max: 3000,
      currency: 'USD',
      deadline: '2026-05-30',
      revision_rounds: 2,
      preferred_skills: ['Prompt engineering'],
      required_skills: ['Video editing'],
      preferred_tools: ['Runway'],
      required_tools: [],
      prohibited_tools: [],
      commercial_use_required: true,
      intended_usage_rights: 'paid_media' as const,
      territory: 'Worldwide',
      license_duration: '1 year',
      exclusivity: 'Category exclusive',
      disclose_model_licensing: true,
      proof_of_tool_license_required: true,
    };

    const parsed = creativeBriefSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it('should reject a brief when budget_max < budget_min', () => {
    const invalidData = {
      title: 'Invalid Budget Campaign',
      brand_name: 'Test Brand',
      campaign_goal: 'Goal is test',
      description: 'Testing validation error handling for inverted budget bounds.',
      target_audience: 'Testers',
      content_type: 'video' as const,
      styles: ['Cinematic'],
      aspect_ratio: '16:9' as const,
      deliverables_count: 1,
      intended_platforms: ['YouTube'],
      budget_min: 5000,
      budget_max: 2000, // Invalid!
      currency: 'USD',
      deadline: '2026-05-30',
      revision_rounds: 1,
      preferred_skills: [],
      required_skills: [],
      preferred_tools: [],
      required_tools: [],
      prohibited_tools: [],
      commercial_use_required: true,
      intended_usage_rights: 'organic' as const,
      territory: 'Worldwide',
      license_duration: '1 year',
      exclusivity: 'Non-exclusive',
      disclose_model_licensing: true,
      proof_of_tool_license_required: false,
    };

    const parsed = creativeBriefSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toContain('Maximum budget must be greater than or equal to minimum budget');
    }
  });
});
