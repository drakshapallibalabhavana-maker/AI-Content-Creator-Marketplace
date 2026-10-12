-- Supabase Migration: 001_initial_schema.sql
-- AI Content Creator Marketplace Schema
-- Enums, Tables, Indexes, and Row Level Security (RLS)

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('creator', 'brand', 'admin');
CREATE TYPE content_type_enum AS ENUM ('video', 'animation', 'image', 'audio', 'mixed');
CREATE TYPE aspect_ratio_enum AS ENUM ('16:9', '9:16', '1:1', '4:5');
CREATE TYPE brief_status_enum AS ENUM ('draft', 'published', 'closed');
CREATE TYPE invitation_status_enum AS ENUM ('invited', 'accepted', 'declined');
CREATE TYPE verification_status_enum AS ENUM ('self_declared', 'evidence_submitted', 'verified', 'rejected');
CREATE TYPE commercial_rights_enum AS ENUM ('organic', 'paid_media', 'broadcast');

-- 2. TABLES

-- Profiles Table (associated with Supabase Auth auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'creator',
    full_name TEXT NOT NULL,
    company_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catalog Tables: Tools, Skills, Specializations
CREATE TABLE tools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'general',
    icon_name TEXT
);

CREATE TABLE skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'general'
);

CREATE TABLE specializations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Creators Table
CREATE TABLE creators (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    headline TEXT NOT NULL,
    bio TEXT NOT NULL,
    avatar_url TEXT,
    location TEXT NOT NULL,
    languages TEXT[] NOT NULL DEFAULT '{"English"}',
    availability TEXT NOT NULL DEFAULT 'available', -- 'available', 'busy', 'unavailable'
    starting_rate NUMERIC NOT NULL DEFAULT 500,
    currency TEXT NOT NULL DEFAULT 'USD',
    turnaround_time TEXT NOT NULL DEFAULT '3-5 days',
    commercial_use_stance TEXT NOT NULL DEFAULT 'Commercial clearance provided with full model & tool licensing disclosure',
    verification_level verification_status_enum NOT NULL DEFAULT 'self_declared',
    profile_completeness INT NOT NULL DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction Tables for Creators
CREATE TABLE creator_tools (
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    tool_id TEXT NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    proficiency_level TEXT DEFAULT 'advanced',
    PRIMARY KEY (creator_id, tool_id)
);

CREATE TABLE creator_skills (
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (creator_id, skill_id)
);

CREATE TABLE creator_specializations (
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    specialization_id TEXT NOT NULL REFERENCES specializations(id) ON DELETE CASCADE,
    PRIMARY KEY (creator_id, specialization_id)
);

-- Portfolio Items Table
CREATE TABLE portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    media_type content_type_enum NOT NULL DEFAULT 'video',
    media_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    creative_style TEXT NOT NULL,
    workflow_summary TEXT NOT NULL,
    prompt_approach TEXT,
    iteration_count INT DEFAULT 1,
    aspect_ratio aspect_ratio_enum NOT NULL DEFAULT '16:9',
    duration_seconds INT,
    resolution TEXT DEFAULT '4K',
    commercial_use_status TEXT NOT NULL DEFAULT 'available', -- 'available', 'restricted', 'editorial_only'
    license_note TEXT NOT NULL DEFAULT 'Commercial use cleared for advertising and social campaigns.',
    verification_status verification_status_enum NOT NULL DEFAULT 'self_declared',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction for Portfolio Item Tools and Skills
CREATE TABLE portfolio_item_tools (
    portfolio_item_id UUID NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
    tool_id TEXT NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    PRIMARY KEY (portfolio_item_id, tool_id)
);

CREATE TABLE portfolio_item_skills (
    portfolio_item_id UUID NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (portfolio_item_id, skill_id)
);

-- Briefs Table
CREATE TABLE briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    title TEXT NOT NULL,
    campaign_goal TEXT NOT NULL,
    description TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    content_type content_type_enum NOT NULL DEFAULT 'video',
    styles TEXT[] NOT NULL DEFAULT '{}',
    creative_direction TEXT,
    aspect_ratio aspect_ratio_enum NOT NULL DEFAULT '16:9',
    duration_seconds INT,
    resolution TEXT DEFAULT '4K',
    deliverables_count INT NOT NULL DEFAULT 1,
    intended_platforms TEXT[] NOT NULL DEFAULT '{"Instagram", "YouTube"}',
    budget_min NUMERIC NOT NULL DEFAULT 1000,
    budget_max NUMERIC NOT NULL DEFAULT 3000,
    currency TEXT NOT NULL DEFAULT 'USD',
    deadline TIMESTAMPTZ NOT NULL,
    revision_rounds INT NOT NULL DEFAULT 2,
    preferred_skills TEXT[] DEFAULT '{}',
    required_skills TEXT[] DEFAULT '{}',
    preferred_tools TEXT[] DEFAULT '{}',
    required_tools TEXT[] DEFAULT '{}',
    prohibited_tools TEXT[] DEFAULT '{}',
    reference_links TEXT[] DEFAULT '{}',
    additional_instructions TEXT,
    
    -- Mandatory Commercial Use Requirements
    commercial_use_required BOOLEAN NOT NULL DEFAULT TRUE,
    intended_usage_rights commercial_rights_enum NOT NULL DEFAULT 'paid_media',
    territory TEXT NOT NULL DEFAULT 'Worldwide',
    license_duration TEXT NOT NULL DEFAULT '1 year',
    exclusivity TEXT NOT NULL DEFAULT 'Non-exclusive',
    disclose_model_licensing BOOLEAN NOT NULL DEFAULT TRUE,
    proof_of_tool_license_required BOOLEAN NOT NULL DEFAULT TRUE,
    licensing_restrictions TEXT DEFAULT 'No unauthorized third-party trademark infringement. Training disclosure required.',
    
    status brief_status_enum NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shortlists Table (Brands saving Creators)
CREATE TABLE shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (brand_id, creator_id)
);

-- Invitations Table (Brands inviting Creators to Briefs)
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id UUID NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    status invitation_status_enum NOT NULL DEFAULT 'invited',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    UNIQUE (brief_id, creator_id)
);

-- Verifications Table
CREATE TABLE verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    portfolio_item_id UUID REFERENCES portfolio_items(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL, -- 'verified_tool', 'documented_workflow', 'past_work_verified'
    evidence_url TEXT,
    evidence_notes TEXT NOT NULL,
    status verification_status_enum NOT NULL DEFAULT 'evidence_submitted',
    reviewer_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INDEXES
CREATE INDEX idx_creators_availability ON creators(availability);
CREATE INDEX idx_creators_starting_rate ON creators(starting_rate);
CREATE INDEX idx_creators_verification ON creators(verification_level);
CREATE INDEX idx_creator_tools_tool ON creator_tools(tool_id);
CREATE INDEX idx_creator_skills_skill ON creator_skills(skill_id);
CREATE INDEX idx_creator_specs_spec ON creator_specializations(specialization_id);
CREATE INDEX idx_portfolio_creator ON portfolio_items(creator_id);
CREATE INDEX idx_portfolio_media_type ON portfolio_items(media_type);
CREATE INDEX idx_portfolio_aspect_ratio ON portfolio_items(aspect_ratio);
CREATE INDEX idx_portfolio_comm_status ON portfolio_items(commercial_use_status);
CREATE INDEX idx_briefs_status ON briefs(status);
CREATE INDEX idx_briefs_brand ON briefs(brand_id);
CREATE INDEX idx_briefs_content_type ON briefs(content_type);
CREATE INDEX idx_shortlists_brand ON shortlists(brand_id);
CREATE INDEX idx_invitations_creator ON invitations(creator_id);
CREATE INDEX idx_invitations_brief ON invitations(brief_id);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_item_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_item_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view public fields; users can update own profile
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Creators: Anyone can view creators; owners can manage
CREATE POLICY "Creators are viewable by everyone" 
ON creators FOR SELECT USING (true);

CREATE POLICY "Creators can insert own profile" 
ON creators FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Creators can update own profile" 
ON creators FOR UPDATE USING (auth.uid() = id);

-- Junction tables: viewable by all; owners can manage
CREATE POLICY "Creator tools viewable by everyone" ON creator_tools FOR SELECT USING (true);
CREATE POLICY "Creator tools managed by owner" ON creator_tools FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Creator skills viewable by everyone" ON creator_skills FOR SELECT USING (true);
CREATE POLICY "Creator skills managed by owner" ON creator_skills FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Creator specializations viewable by everyone" ON creator_specializations FOR SELECT USING (true);
CREATE POLICY "Creator specializations managed by owner" ON creator_specializations FOR ALL USING (auth.uid() = creator_id);

-- Portfolio: viewable by all; creator manages own items
CREATE POLICY "Portfolio items are viewable by everyone" 
ON portfolio_items FOR SELECT USING (true);

CREATE POLICY "Creators can insert own portfolio items" 
ON portfolio_items FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own portfolio items" 
ON portfolio_items FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own portfolio items" 
ON portfolio_items FOR DELETE USING (auth.uid() = creator_id);

CREATE POLICY "Portfolio tools viewable by everyone" ON portfolio_item_tools FOR SELECT USING (true);
CREATE POLICY "Portfolio skills viewable by everyone" ON portfolio_item_skills FOR SELECT USING (true);

-- Briefs: Published briefs are viewable by all; drafts/closed only viewable by brand owner
CREATE POLICY "Published briefs are viewable by everyone" 
ON briefs FOR SELECT USING (status = 'published' OR auth.uid() = brand_id);

CREATE POLICY "Brands can create briefs" 
ON briefs FOR INSERT WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update their own briefs" 
ON briefs FOR UPDATE USING (auth.uid() = brand_id);

CREATE POLICY "Brands can delete their own drafts" 
ON briefs FOR DELETE USING (auth.uid() = brand_id AND status = 'draft');

-- Shortlists: Brands manage their own shortlist
CREATE POLICY "Brands can view own shortlist" 
ON shortlists FOR SELECT USING (auth.uid() = brand_id);

CREATE POLICY "Brands can insert into shortlist" 
ON shortlists FOR INSERT WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can remove from shortlist" 
ON shortlists FOR DELETE USING (auth.uid() = brand_id);

-- Invitations: Brand who sent it OR invited creator can view
CREATE POLICY "Invitations viewable by brand or creator" 
ON invitations FOR SELECT USING (auth.uid() = brand_id OR auth.uid() = creator_id);

CREATE POLICY "Brands can send invitations" 
ON invitations FOR INSERT WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Creators can update invitation status" 
ON invitations FOR UPDATE USING (auth.uid() = creator_id);

-- Verifications: Viewable by everyone; submitted by creator; reviewed by admin
CREATE POLICY "Verifications viewable by everyone" 
ON verifications FOR SELECT USING (true);

CREATE POLICY "Creators can submit verifications" 
ON verifications FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Storage bucket creation SQL helper
-- INSERT INTO storage.buckets (id, name, public) VALUES ('marketplace-media', 'marketplace-media', true);
