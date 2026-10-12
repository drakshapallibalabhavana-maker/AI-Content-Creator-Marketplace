export type UserRole = 'creator' | 'brand' | 'admin';

export type ContentType = 'video' | 'animation' | 'image' | 'audio' | 'mixed';
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';
export type AvailabilityStatus = 'available' | 'busy' | 'unavailable';
export type BriefStatus = 'draft' | 'published' | 'closed';
export type InvitationStatus = 'invited' | 'accepted' | 'declined';
export type VerificationLevel = 'self_declared' | 'evidence_submitted' | 'verified' | 'rejected';
export type CommercialRights = 'organic' | 'paid_media' | 'broadcast';
export type CommercialUseStatus = 'available' | 'restricted' | 'editorial_only';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  company_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface ToolCatalogItem {
  id: string;
  name: string;
  category: 'video' | 'image' | 'audio' | 'editing' | '3d';
  icon_name?: string;
}

export interface SkillCatalogItem {
  id: string;
  name: string;
  category?: string;
}

export interface SpecializationCatalogItem {
  id: string;
  name: string;
}

export interface PortfolioItem {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  media_type: ContentType;
  media_url: string;
  thumbnail_url: string;
  creative_style: string;
  workflow_summary: string;
  prompt_approach?: string;
  iteration_count?: number;
  aspect_ratio: AspectRatio;
  duration_seconds?: number;
  resolution: string;
  commercial_use_status: CommercialUseStatus;
  license_note: string;
  verification_status: VerificationLevel;
  tools_used: string[];
  skills_demonstrated: string[];
  created_at: string;
}

export interface CreatorProfile {
  id: string;
  email?: string;
  display_name: string;
  headline: string;
  bio: string;
  avatar_url: string;
  location: string;
  languages: string[];
  availability: AvailabilityStatus;
  starting_rate: number;
  currency: string;
  turnaround_time: string;
  commercial_use_stance: string;
  verification_level: VerificationLevel;
  profile_completeness: number;
  specializations: string[];
  skills: string[];
  tools: string[];
  portfolio_items?: PortfolioItem[];
  created_at: string;
  updated_at?: string;
}

export interface CreativeBrief {
  id: string;
  brand_id: string;
  brand_name: string;
  title: string;
  campaign_goal: string;
  description: string;
  target_audience: string;
  content_type: ContentType;
  styles: string[];
  creative_direction?: string;
  aspect_ratio: AspectRatio;
  duration_seconds?: number;
  resolution?: string;
  deliverables_count: number;
  intended_platforms: string[];
  budget_min: number;
  budget_max: number;
  currency: string;
  deadline: string;
  revision_rounds: number;
  preferred_skills?: string[];
  required_skills?: string[];
  preferred_tools?: string[];
  required_tools?: string[];
  prohibited_tools?: string[];
  reference_links?: string[];
  additional_instructions?: string;
  
  // Commercial-use terms
  commercial_use_required: boolean;
  intended_usage_rights: CommercialRights;
  territory: string;
  license_duration: string;
  exclusivity: string;
  disclose_model_licensing: boolean;
  proof_of_tool_license_required: boolean;
  licensing_restrictions?: string;

  status: BriefStatus;
  created_at: string;
  updated_at?: string;
}

export interface ShortlistItem {
  id: string;
  brand_id: string;
  creator_id: string;
  creator?: CreatorProfile;
  notes?: string;
  created_at: string;
}

export interface InvitationItem {
  id: string;
  brief_id: string;
  creator_id: string;
  brand_id: string;
  brief?: CreativeBrief;
  creator?: CreatorProfile;
  message?: string;
  status: InvitationStatus;
  created_at: string;
  responded_at?: string;
}

export interface VerificationRecord {
  id: string;
  creator_id: string;
  portfolio_item_id?: string;
  badge_type: 'verified_tool' | 'documented_workflow' | 'past_work_verified';
  evidence_url?: string;
  evidence_notes: string;
  status: VerificationLevel;
  reviewer_notes?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface DiscoveryFilterParams {
  query?: string;
  skills?: string[];
  specializations?: string[];
  tools?: string[];
  content_types?: ContentType[];
  aspect_ratios?: AspectRatio[];
  commercial_use?: CommercialUseStatus[];
  verification_level?: VerificationLevel[];
  availability?: AvailabilityStatus[];
  price_min?: number;
  price_max?: number;
  sort_by?: 'relevance' | 'newest' | 'price_asc' | 'verification';
  page?: number;
  limit?: number;
}
