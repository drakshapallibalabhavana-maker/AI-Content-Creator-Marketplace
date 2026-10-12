import { z } from 'zod';

export const creatorProfileSchema = z.object({
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  headline: z.string().min(5, 'Headline must be at least 5 characters'),
  bio: z.string().min(20, 'Bio must provide at least 20 characters of background and expertise'),
  location: z.string().min(2, 'Location is required'),
  starting_rate: z.number().min(50, 'Starting rate must be at least $50'),
  currency: z.string().default('USD'),
  turnaround_time: z.string().min(2, 'Typical turnaround time is required'),
  commercial_use_stance: z.string().min(10, 'Please clearly define your commercial-use and model licensing stance'),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  tools: z.array(z.string()).min(1, 'Select at least one AI tool or model'),
  specializations: z.array(z.string()).min(1, 'Select at least one creative specialization'),
  availability: z.enum(['available', 'busy', 'unavailable']),
});

export const portfolioItemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must explain the piece (min 10 characters)'),
  media_type: z.enum(['video', 'animation', 'image', 'audio', 'mixed']),
  media_url: z.string().refine(
    (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
    { message: 'A valid media URL or local video path (/videos/...) is required' }
  ),
  thumbnail_url: z.string().refine(
    (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
    { message: 'A valid thumbnail URL or local path is required' }
  ),
  creative_style: z.string().min(2, 'Creative style is required'),
  workflow_summary: z.string().min(15, 'Document your AI generation workflow steps (min 15 characters)'),
  prompt_approach: z.string().optional(),
  iteration_count: z.number().int().min(1).default(1),
  aspect_ratio: z.enum(['16:9', '9:16', '1:1', '4:5']),
  duration_seconds: z.number().int().positive().optional(),
  resolution: z.string().default('4K'),
  commercial_use_status: z.enum(['available', 'restricted', 'editorial_only']),
  license_note: z.string().min(5, 'Include commercial licensing terms'),
  tools_used: z.array(z.string()).min(1, 'Tag at least one tool used'),
  skills_demonstrated: z.array(z.string()).min(1, 'Tag at least one skill demonstrated'),
});

export const creativeBriefSchema = z.object({
  title: z.string().min(5, 'Campaign title must be at least 5 characters'),
  brand_name: z.string().min(2, 'Brand/Company name is required'),
  campaign_goal: z.string().min(10, 'Campaign goal must be clearly described'),
  description: z.string().min(20, 'Brief description must be at least 20 characters'),
  target_audience: z.string().min(5, 'Target audience description is required'),
  content_type: z.enum(['video', 'animation', 'image', 'audio', 'mixed']),
  styles: z.array(z.string()).min(1, 'Select at least one creative style'),
  creative_direction: z.string().optional(),
  aspect_ratio: z.enum(['16:9', '9:16', '1:1', '4:5']),
  duration_seconds: z.number().int().positive().optional(),
  resolution: z.string().default('4K'),
  deliverables_count: z.number().int().min(1, 'Deliverables count must be at least 1'),
  intended_platforms: z.array(z.string()).min(1, 'Select at least one intended platform'),
  budget_min: z.number().min(100, 'Minimum budget must be at least $100'),
  budget_max: z.number().min(100, 'Maximum budget must be at least $100'),
  currency: z.string().default('USD'),
  deadline: z.string().min(8, 'A valid deadline date is required'),
  revision_rounds: z.number().int().min(1).default(2),
  preferred_skills: z.array(z.string()).default([]),
  required_skills: z.array(z.string()).default([]),
  preferred_tools: z.array(z.string()).default([]),
  required_tools: z.array(z.string()).default([]),
  prohibited_tools: z.array(z.string()).default([]),
  
  // Mandatory Commercial Use
  commercial_use_required: z.boolean().default(true),
  intended_usage_rights: z.enum(['organic', 'paid_media', 'broadcast']),
  territory: z.string().min(2, 'Territory specification is required (e.g. Worldwide, Regional)'),
  license_duration: z.string().min(2, 'License duration is required (e.g. 1 year, Perpetual)'),
  exclusivity: z.string().min(2, 'Exclusivity terms are required'),
  disclose_model_licensing: z.boolean().default(true),
  proof_of_tool_license_required: z.boolean().default(true),
  licensing_restrictions: z.string().optional(),
}).refine((data) => data.budget_max >= data.budget_min, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budget_max'],
});

export const aiBriefPromptSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters long describing your campaign idea'),
});
