import {
  CreatorProfile,
  CreativeBrief,
  ShortlistItem,
  InvitationItem,
  VerificationRecord,
  DiscoveryFilterParams,
  PortfolioItem,
  ContentType,
  ProjectStatus,
  StatusTransitionRecord,
} from '@/types';
import {
  INITIAL_CREATORS,
  INITIAL_BRIEFS,
  INITIAL_SHORTLISTS,
  INITIAL_INVITATIONS,
  INITIAL_VERIFICATIONS,
} from './seed-data';

const STORAGE_KEYS = {
  CREATORS: 'cc_ai_creators_v2',
  BRIEFS: 'cc_ai_briefs_v1',
  SHORTLISTS: 'cc_ai_shortlists_v1',
  INVITATIONS: 'cc_ai_invitations_v1',
  VERIFICATIONS: 'cc_ai_verifications_v1',
};

// Memory fallback for SSR & initial server render
let memoryCreators: CreatorProfile[] = [...INITIAL_CREATORS];
let memoryBriefs: CreativeBrief[] = [...INITIAL_BRIEFS];
let memoryShortlists: ShortlistItem[] = [...INITIAL_SHORTLISTS];
let memoryInvitations: InvitationItem[] = [...INITIAL_INVITATIONS];
let memoryVerifications: VerificationRecord[] = [...INITIAL_VERIFICATIONS];
// suppress unused warning and allow reassign
if (memoryVerifications.length < 0) memoryVerifications = [];

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function sanitizeCreatorMedia(creators: CreatorProfile[]): CreatorProfile[] {
  return creators.map((c) => ({
    ...c,
    portfolio_items: (c.portfolio_items || []).map((item) => {
      if (item.media_url && item.media_url.includes('commondatastorage.googleapis.com')) {
        return {
          ...item,
          media_url: '/videos/cyberpunk-pulse.mp4',
        };
      }
      return item;
    }),
  }));
}

function loadStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

export function getAllCreators(): CreatorProfile[] {
  const rawList = loadStorage<CreatorProfile[]>(STORAGE_KEYS.CREATORS, memoryCreators);
  const list = sanitizeCreatorMedia(rawList);
  return list;
}

export function getCreatorById(id: string): CreatorProfile | undefined {
  const creators = getAllCreators();
  return creators.find((c) => c.id === id);
}

export function updateCreatorProfile(id: string, updates: Partial<CreatorProfile>): CreatorProfile {
  const list = getAllCreators();
  const index = list.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error(`Creator with ID ${id} not found`);
  }

  // Recalculate completeness
  const updated = {
    ...list[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  let score = 0;
  if (updated.display_name && updated.headline) score += 20;
  if (updated.bio && updated.bio.length > 30) score += 20;
  if (updated.skills && updated.skills.length > 0) score += 15;
  if (updated.tools && updated.tools.length > 0) score += 15;
  if (updated.specializations && updated.specializations.length > 0) score += 15;
  if (updated.portfolio_items && updated.portfolio_items.length > 0) score += 15;
  updated.profile_completeness = Math.min(100, score);

  list[index] = updated;
  saveStorage(STORAGE_KEYS.CREATORS, list);
  memoryCreators = list;
  return updated;
}

export function addPortfolioItem(
  creatorId: string,
  item: Omit<PortfolioItem, 'id' | 'created_at' | 'creator_id'>
): PortfolioItem {
  const list = getAllCreators();
  const index = list.findIndex((c) => c.id === creatorId);
  if (index === -1) throw new Error(`Creator with ID ${creatorId} not found`);

  const newItem: PortfolioItem = {
    ...item,
    id: `p-${Date.now()}`,
    creator_id: creatorId,
    created_at: new Date().toISOString(),
  };

  const currentItems = list[index].portfolio_items || [];
  list[index].portfolio_items = [newItem, ...currentItems];

  updateCreatorProfile(creatorId, { portfolio_items: list[index].portfolio_items });
  return newItem;
}

export function updatePortfolioItem(
  creatorId: string,
  itemId: string,
  updates: Partial<PortfolioItem>
): PortfolioItem {
  const list = getAllCreators();
  const index = list.findIndex((c) => c.id === creatorId);
  if (index === -1) throw new Error(`Creator ${creatorId} not found`);

  const items = list[index].portfolio_items || [];
  const itemIndex = items.findIndex((p) => p.id === itemId);
  if (itemIndex === -1) throw new Error(`Portfolio item ${itemId} not found`);

  const updatedItem = {
    ...items[itemIndex],
    ...updates,
  };

  items[itemIndex] = updatedItem;
  updateCreatorProfile(creatorId, { portfolio_items: items });
  return updatedItem;
}

export function deletePortfolioItem(creatorId: string, itemId: string): boolean {
  const list = getAllCreators();
  const index = list.findIndex((c) => c.id === creatorId);
  if (index === -1) return false;

  const items = list[index].portfolio_items || [];
  const filtered = items.filter((p) => p.id !== itemId);
  updateCreatorProfile(creatorId, { portfolio_items: filtered });
  return true;
}

// ==========================================
// FILTERING & SEARCH ENGINE (STRICT SEMANTICS)
// AND-across-categories, OR-within-category
// ==========================================
export function filterCreators(params: DiscoveryFilterParams): {
  creators: CreatorProfile[];
  total: number;
  relaxedSuggestions?: CreatorProfile[];
  restrictiveFilterCategories: string[];
} {
  const all = getAllCreators();

  const query = (params.query || '').trim().toLowerCase();
  const selectedSkills = params.skills || [];
  const selectedSpecializations = params.specializations || [];
  const selectedTools = params.tools || [];
  const selectedContentTypes = params.content_types || [];
  const selectedAspectRatios = params.aspect_ratios || [];
  const selectedCommercialUse = params.commercial_use || [];
  const selectedVerifications = params.verification_level || [];
  const selectedAvailability = params.availability || [];
  const priceMin = params.price_min;
  const priceMax = params.price_max;

  function matchesCategory(
    itemValues: string[],
    filterValues: string[]
  ): boolean {
    if (filterValues.length === 0) return true;
    const lowerItem = itemValues.map((v) => v.toLowerCase());
    return filterValues.some((f) => lowerItem.includes(f.toLowerCase()));
  }

  function matchesSingleCategory(
    itemValue: string | undefined,
    filterValues: string[]
  ): boolean {
    if (filterValues.length === 0) return true;
    if (!itemValue) return false;
    return filterValues.some((f) => f.toLowerCase() === itemValue.toLowerCase());
  }

  function creatorMatches(c: CreatorProfile, skipCategory?: string): boolean {
    // 1. Text Query Search
    if (skipCategory !== 'query' && query) {
      const matchText = [
        c.display_name,
        c.headline,
        c.bio,
        c.location,
        ...(c.skills || []),
        ...(c.specializations || []),
        ...(c.tools || []),
        ...((c.portfolio_items || []).flatMap((p) => [p.title, p.description, p.workflow_summary])),
      ]
        .join(' ')
        .toLowerCase();

      if (!matchText.includes(query)) return false;
    }

    // 2. Skills (OR within category)
    if (skipCategory !== 'skills' && !matchesCategory(c.skills, selectedSkills)) {
      return false;
    }

    // 3. Specializations (OR within category)
    if (skipCategory !== 'specializations' && !matchesCategory(c.specializations, selectedSpecializations)) {
      return false;
    }

    // 4. Tools (OR within category)
    if (skipCategory !== 'tools' && !matchesCategory(c.tools, selectedTools)) {
      return false;
    }

    // 5. Content Types (inspected from portfolio items)
    if (skipCategory !== 'content_types' && selectedContentTypes.length > 0) {
      const creatorMediaTypes = (c.portfolio_items || []).map((p) => p.media_type);
      const hasMatch = selectedContentTypes.some((type) => creatorMediaTypes.includes(type));
      if (!hasMatch) return false;
    }

    // 6. Aspect Ratios
    if (skipCategory !== 'aspect_ratios' && selectedAspectRatios.length > 0) {
      const creatorRatios = (c.portfolio_items || []).map((p) => p.aspect_ratio);
      const hasMatch = selectedAspectRatios.some((ratio) => creatorRatios.includes(ratio));
      if (!hasMatch) return false;
    }

    // 7. Commercial Use Availability
    if (skipCategory !== 'commercial_use' && selectedCommercialUse.length > 0) {
      const itemStatuses = (c.portfolio_items || []).map((p) => p.commercial_use_status);
      const hasMatch = selectedCommercialUse.some(
        (status) => itemStatuses.includes(status) || (status === 'available' && c.commercial_use_stance.toLowerCase().includes('commercial'))
      );
      if (!hasMatch) return false;
    }

    // 8. Verification Level
    if (skipCategory !== 'verification_level' && !matchesSingleCategory(c.verification_level, selectedVerifications)) {
      return false;
    }

    // 9. Availability
    if (skipCategory !== 'availability' && !matchesSingleCategory(c.availability, selectedAvailability)) {
      return false;
    }

    // 10. Price Range
    if (skipCategory !== 'price') {
      if (priceMin !== undefined && c.starting_rate < priceMin) return false;
      if (priceMax !== undefined && c.starting_rate > priceMax) return false;
    }

    return true;
  }

  // Exact matches
  const results = all.filter((c) => creatorMatches(c));

  // Determine restrictive filters when results are 0
  const restrictiveCategories: string[] = [];
  if (results.length === 0) {
    const categoriesToCheck = [
      { name: 'tools', active: selectedTools.length > 0 },
      { name: 'skills', active: selectedSkills.length > 0 },
      { name: 'specializations', active: selectedSpecializations.length > 0 },
      { name: 'content_types', active: selectedContentTypes.length > 0 },
      { name: 'aspect_ratios', active: selectedAspectRatios.length > 0 },
      { name: 'verification_level', active: selectedVerifications.length > 0 },
      { name: 'availability', active: selectedAvailability.length > 0 },
      { name: 'price', active: priceMin !== undefined || priceMax !== undefined },
      { name: 'query', active: Boolean(query) },
    ];

    for (const cat of categoriesToCheck) {
      if (cat.active) {
        const withoutCategoryMatches = all.filter((c) => creatorMatches(c, cat.name));
        if (withoutCategoryMatches.length > 0) {
          restrictiveCategories.push(cat.name);
        }
      }
    }

    // If no single filter removal yielded results, then all active filters together are restrictive
    if (restrictiveCategories.length === 0) {
      for (const cat of categoriesToCheck) {
        if (cat.active) {
          restrictiveCategories.push(cat.name);
        }
      }
    }
  }

  // Relaxed suggestions if 0 exact matches
  let relaxedSuggestions: CreatorProfile[] | undefined = undefined;
  if (results.length === 0) {
    // Relax by requiring only partial criteria (e.g. match query or tools or skills)
    const scored = all.map((c) => {
      let score = 0;
      if (query && [c.display_name, c.headline, c.bio].join(' ').toLowerCase().includes(query)) score += 3;
      if (selectedTools.some((t) => c.tools.map((x) => x.toLowerCase()).includes(t.toLowerCase()))) score += 2;
      if (selectedSkills.some((s) => c.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase()))) score += 2;
      if (selectedSpecializations.some((s) => c.specializations.map((x) => x.toLowerCase()).includes(s.toLowerCase()))) score += 1;
      if (c.verification_level === 'verified') score += 1;
      return { creator: c, score };
    });

    relaxedSuggestions = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((s) => s.creator);
  }

  // Sorting
  const sortBy = params.sort_by || 'relevance';
  results.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'price_asc') {
      const diff = a.starting_rate - b.starting_rate;
      return diff !== 0 ? diff : a.display_name.localeCompare(b.display_name);
    }
    if (sortBy === 'verification') {
      const weight: Record<string, number> = {
        verified: 3,
        evidence_submitted: 2,
        self_declared: 1,
        rejected: 0,
      };
      const diff = (weight[b.verification_level] || 0) - (weight[a.verification_level] || 0);
      return diff !== 0 ? diff : a.display_name.localeCompare(b.display_name);
    }

    // Default 'relevance' scoring
    const getScore = (c: CreatorProfile): number => {
      let s = 0;
      if (query) {
        if (c.display_name.toLowerCase().includes(query)) s += 10;
        if (c.headline.toLowerCase().includes(query)) s += 6;
        if (c.bio.toLowerCase().includes(query)) s += 3;
      }
      if (selectedSkills.some((sk) => c.skills.includes(sk))) s += 4;
      if (selectedTools.some((t) => c.tools.includes(t))) s += 4;
      if (c.verification_level === 'verified') s += 3;
      if (c.availability === 'available') s += 2;
      return s;
    };

    const diff = getScore(b) - getScore(a);
    return diff !== 0 ? diff : a.display_name.localeCompare(b.display_name);
  });

  const total = results.length;
  const page = params.page || 1;
  const limit = params.limit || 12;
  const paginated = results.slice((page - 1) * limit, page * limit);

  return {
    creators: paginated,
    total,
    relaxedSuggestions,
    restrictiveFilterCategories: restrictiveCategories,
  };
}

// ==========================================
// BRIEFS MANAGEMENT
// ==========================================
export function getAllBriefs(): CreativeBrief[] {
  return loadStorage<CreativeBrief[]>(STORAGE_KEYS.BRIEFS, memoryBriefs);
}

export function getBriefById(id: string): CreativeBrief | undefined {
  const briefs = getAllBriefs();
  return briefs.find((b) => b.id === id);
}

export function createBrief(
  brief: Omit<CreativeBrief, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
  }
): CreativeBrief {
  const list = getAllBriefs();
  const newBrief: CreativeBrief = {
    ...brief,
    id: brief.id || `b-${Date.now()}`,
    created_at: brief.created_at || new Date().toISOString(),
    updated_at: brief.updated_at || new Date().toISOString(),
  };

  const updatedList = [newBrief, ...list.filter((b) => b.id !== newBrief.id)];
  saveStorage(STORAGE_KEYS.BRIEFS, updatedList);
  memoryBriefs = updatedList;
  return newBrief;
}

export function updateBrief(id: string, updates: Partial<CreativeBrief>): CreativeBrief {
  const list = getAllBriefs();
  const index = list.findIndex((b) => b.id === id);
  if (index === -1) throw new Error(`Brief ${id} not found`);

  const updated: CreativeBrief = {
    ...list[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  list[index] = updated;
  saveStorage(STORAGE_KEYS.BRIEFS, list);
  memoryBriefs = list;
  return updated;
}

export function closeBrief(id: string): CreativeBrief {
  return updateBrief(id, { status: 'closed' });
}

// ==========================================
// SHORTLISTS
// ==========================================
export function getShortlists(brandId: string): ShortlistItem[] {
  const list = loadStorage<ShortlistItem[]>(STORAGE_KEYS.SHORTLISTS, memoryShortlists);
  const creators = getAllCreators();
  return list
    .filter((s) => s.brand_id === brandId)
    .map((s) => ({
      ...s,
      creator: creators.find((c) => c.id === s.creator_id),
    }));
}

export function addToShortlist(brandId: string, creatorId: string, notes?: string): ShortlistItem {
  const list = loadStorage<ShortlistItem[]>(STORAGE_KEYS.SHORTLISTS, memoryShortlists);
  const existing = list.find((s) => s.brand_id === brandId && s.creator_id === creatorId);
  if (existing) return existing;

  const newItem: ShortlistItem = {
    id: `s-${Date.now()}`,
    brand_id: brandId,
    creator_id: creatorId,
    notes,
    created_at: new Date().toISOString(),
  };

  const updated = [newItem, ...list];
  saveStorage(STORAGE_KEYS.SHORTLISTS, updated);
  memoryShortlists = updated;
  return newItem;
}

export function removeFromShortlist(brandId: string, creatorId: string): boolean {
  const list = loadStorage<ShortlistItem[]>(STORAGE_KEYS.SHORTLISTS, memoryShortlists);
  const filtered = list.filter((s) => !(s.brand_id === brandId && s.creator_id === creatorId));
  saveStorage(STORAGE_KEYS.SHORTLISTS, filtered);
  memoryShortlists = filtered;
  return true;
}

export function isShortlisted(brandId: string, creatorId: string): boolean {
  const list = loadStorage<ShortlistItem[]>(STORAGE_KEYS.SHORTLISTS, memoryShortlists);
  return list.some((s) => s.brand_id === brandId && s.creator_id === creatorId);
}

// ==========================================
// INVITATIONS
// ==========================================
export function getInvitations(filter: { brandId?: string; creatorId?: string }): InvitationItem[] {
  const list = loadStorage<InvitationItem[]>(STORAGE_KEYS.INVITATIONS, memoryInvitations);
  const briefs = getAllBriefs();
  const creators = getAllCreators();

  return list
    .filter((inv) => {
      if (filter.brandId && inv.brand_id !== filter.brandId) return false;
      if (filter.creatorId && inv.creator_id !== filter.creatorId) return false;
      return true;
    })
    .map((inv) => ({
      ...inv,
      brief: briefs.find((b) => b.id === inv.brief_id),
      creator: creators.find((c) => c.id === inv.creator_id),
    }));
}

export function createInvitation(
  briefId: string,
  creatorId: string,
  brandId: string,
  message?: string
): InvitationItem {
  const brief = getBriefById(briefId);
  if (!brief) throw new Error(`Brief ${briefId} not found`);
  if (brief.status === 'closed') throw new Error(`Cannot invite creators to a closed brief`);

  const list = loadStorage<InvitationItem[]>(STORAGE_KEYS.INVITATIONS, memoryInvitations);
  const existing = list.find((inv) => inv.brief_id === briefId && inv.creator_id === creatorId);
  if (existing) return existing;

  const newInv: InvitationItem = {
    id: `inv-${Date.now()}`,
    brief_id: briefId,
    creator_id: creatorId,
    brand_id: brandId,
    message,
    status: 'invited',
    created_at: new Date().toISOString(),
  };

  const updated = [newInv, ...list];
  saveStorage(STORAGE_KEYS.INVITATIONS, updated);
  memoryInvitations = updated;
  return newInv;
}

export interface WorkflowTransitionPayload {
  projectId: string;
  targetStatus: ProjectStatus;
  userId: string;
  userRole: 'creator' | 'brand' | 'admin';
  deliverableUrl?: string;
  deliverableNotes?: string;
  revisionNotes?: string;
  note?: string;
}

export function updateProjectWorkflowStatus(payload: WorkflowTransitionPayload): InvitationItem {
  const list = loadStorage<InvitationItem[]>(STORAGE_KEYS.INVITATIONS, memoryInvitations);
  const index = list.findIndex((inv) => inv.id === payload.projectId);
  if (index === -1) throw new Error(`Project with ID ${payload.projectId} not found`);

  const current = list[index];
  const currentStatus = current.status;
  const target = payload.targetStatus;
  const role = payload.userRole;

  if (currentStatus === target) {
    return current;
  }

  // Validate allowed state transitions per role
  if (role === 'creator') {
    const creatorAllowed =
      (currentStatus === 'invited' && (target === 'accepted' || target === 'declined')) ||
      (currentStatus === 'accepted' && target === 'in_production') ||
      (currentStatus === 'in_production' && target === 'delivered') ||
      (currentStatus === 'revision_requested' && (target === 'in_production' || target === 'delivered'));

    if (!creatorAllowed) {
      throw new Error(`Creators cannot transition project status from "${currentStatus}" to "${target}".`);
    }
  }

  if (role === 'brand') {
    const brandAllowed =
      (currentStatus === 'invited' && target === 'cancelled') ||
      (currentStatus === 'accepted' && target === 'cancelled') ||
      (currentStatus === 'delivered' && (target === 'approved' || target === 'revision_requested'));

    if (!brandAllowed) {
      throw new Error(`Brands cannot transition project status from "${currentStatus}" to "${target}".`);
    }
  }

  const now = new Date().toISOString();
  const transitionRecord: StatusTransitionRecord = {
    from_status: currentStatus,
    to_status: target,
    timestamp: now,
    user_id: payload.userId,
    user_role: payload.userRole,
    notes: payload.note || payload.revisionNotes || payload.deliverableNotes,
  };

  const updatedHistory = [...(current.history || []), transitionRecord];

  const updated: InvitationItem = {
    ...current,
    status: target,
    history: updatedHistory,
    ...(payload.deliverableUrl ? { deliverable_url: payload.deliverableUrl } : {}),
    ...(payload.deliverableNotes ? { deliverable_notes: payload.deliverableNotes } : {}),
    ...(target === 'delivered' ? { delivered_at: now } : {}),
    ...(target === 'revision_requested' && payload.revisionNotes ? { revision_notes: payload.revisionNotes } : {}),
    ...(target === 'approved' ? { approved_at: now } : {}),
    ...(target === 'accepted' || target === 'declined' ? { responded_at: now } : {}),
  };

  list[index] = updated;
  saveStorage(STORAGE_KEYS.INVITATIONS, list);
  memoryInvitations = list;
  return updated;
}

export function updateInvitationStatus(
  invitationId: string,
  status: ProjectStatus,
  notes?: string
): InvitationItem {
  return updateProjectWorkflowStatus({
    projectId: invitationId,
    targetStatus: status,
    userId: 'system-user',
    userRole: status === 'approved' || status === 'revision_requested' ? 'brand' : 'creator',
    note: notes,
  });
}

// ==========================================
// BRIEF MATCHING SUGGESTIONS (DETERMINISTIC)
// Transparent scoring based on skill, tool,
// specialization, budget, turnaround, aspect ratio & commercial terms
// ==========================================
export interface MatchingCreatorResult {
  creator: CreatorProfile;
  matchScore: number;
  matchReasons: string[];
  rightsMismatch: boolean;
  rightsNote?: string;
}

export function getMatchingCreatorsForBrief(brief: CreativeBrief): MatchingCreatorResult[] {
  const creators = getAllCreators();
  const scored = creators.map((creator) => {
    let score = 0;
    const reasons: string[] = [];
    let rightsMismatch = false;
    let rightsNote: string | undefined = undefined;

    // 1. Tool overlap (required vs preferred)
    if (brief.required_tools && brief.required_tools.length > 0) {
      const matchReq = brief.required_tools.filter((t) =>
        creator.tools.map((x) => x.toLowerCase()).includes(t.toLowerCase())
      );
      if (matchReq.length > 0) {
        score += 25;
        reasons.push(`Matches required AI tools: ${matchReq.join(', ')}`);
      }
    }
    if (brief.preferred_tools && brief.preferred_tools.length > 0) {
      const matchTools = brief.preferred_tools.filter((t) =>
        creator.tools.map((x) => x.toLowerCase()).includes(t.toLowerCase())
      );
      if (matchTools.length > 0) {
        score += matchTools.length * 8;
        reasons.push(`Uses preferred tools: ${matchTools.join(', ')}`);
      }
    }

    // 2. Skill overlap (required vs preferred)
    if (brief.required_skills && brief.required_skills.length > 0) {
      const matchReqSkill = brief.required_skills.filter((s) =>
        creator.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase())
      );
      if (matchReqSkill.length > 0) {
        score += 20;
        reasons.push(`Demonstrates required production skills: ${matchReqSkill.join(', ')}`);
      }
    }
    if (brief.preferred_skills && brief.preferred_skills.length > 0) {
      const matchSkills = brief.preferred_skills.filter((s) =>
        creator.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase())
      );
      if (matchSkills.length > 0) {
        score += matchSkills.length * 6;
        reasons.push(`Has preferred skills: ${matchSkills.slice(0, 2).join(', ')}`);
      }
    }

    // 3. Content Type & Aspect Ratio compatibility
    const portfolio = creator.portfolio_items || [];
    const hasContentType = portfolio.some((p) => p.media_type === brief.content_type);
    if (hasContentType) {
      score += 15;
      reasons.push(`Portfolio features verified ${brief.content_type} deliverables`);
    }

    const hasRatio = portfolio.some((p) => p.aspect_ratio === brief.aspect_ratio);
    if (hasRatio) {
      score += 10;
      reasons.push(`Proven track record in ${brief.aspect_ratio} aspect ratio`);
    }

    // 4. Budget Compatibility
    if (brief.budget_max) {
      if (creator.starting_rate <= brief.budget_max) {
        if (creator.starting_rate >= brief.budget_min) {
          score += 15;
          reasons.push(`Starting rate ($${creator.starting_rate}) aligns with campaign budget ($${brief.budget_min}–$${brief.budget_max})`);
        } else {
          score += 10;
          reasons.push(`Starting rate ($${creator.starting_rate}) is cost-effective within campaign budget`);
        }
      } else {
        score -= 10;
        reasons.push(`Budget note: Creator starting rate ($${creator.starting_rate}) exceeds maximum budget ($${brief.budget_max})`);
      }
    }

    // 5. Commercial-use Readiness & Rights Mismatch Detection
    const stanceLower = creator.commercial_use_stance.toLowerCase();
    const hasCommercialStance =
      stanceLower.includes('commercial') ||
      stanceLower.includes('rights') ||
      stanceLower.includes('full buyout');

    if (brief.commercial_use_required) {
      if (hasCommercialStance) {
        score += 15;
        reasons.push('Stated commercial licensing clearance policy');
      } else {
        rightsMismatch = true;
        rightsNote = 'Creator commercial use stance does not explicitly cover commercial campaigns.';
        reasons.push('Warning: Commercial rights clearance needs contract verification');
      }
    }

    // Check specific rights tier (broadcast vs editorial only)
    if (brief.intended_usage_rights === 'broadcast') {
      const anyEditorialOnly = portfolio.length > 0 && portfolio.every((p) => p.commercial_use_status === 'editorial_only');
      if (anyEditorialOnly) {
        rightsMismatch = true;
        rightsNote = 'Creator deliverables are tagged editorial-only. Broadcast licensing rights must be negotiated.';
        reasons.push('Rights mismatch: Portfolio assets are editorial-only');
      } else {
        reasons.push('Broadcast rights eligible');
      }
    }

    // 6. Verification Status (truthful, never falsified)
    if (creator.verification_level === 'verified') {
      score += 10;
      reasons.push('Audited and verified AI creator status');
    } else if (creator.verification_level === 'evidence_submitted') {
      score += 5;
      reasons.push('Evidence submitted for commercial verification');
    }

    // 7. Availability & Turnaround capability
    if (creator.availability === 'available') {
      score += 5;
      reasons.push('Available for immediate campaign kickoff');
    } else if (creator.availability === 'busy') {
      reasons.push(`Schedule notice: Creator currently busy (Turnaround: ${creator.turnaround_time})`);
    }

    return {
      creator,
      matchScore: Math.max(0, Math.min(100, score)),
      matchReasons: reasons,
      rightsMismatch,
      rightsNote,
    };
  });

  return scored.filter((s) => s.matchScore > 15).sort((a, b) => b.matchScore - a.matchScore);
}
