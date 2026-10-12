-- Supabase Seed Data (matches src/lib/seed-data.ts)
-- Run after 001_initial_schema.sql

-- 1. Tools Catalog
INSERT INTO tools (id, name, category) VALUES
('midjourney', 'Midjourney', 'image'),
('runway', 'Runway', 'video'),
('sora', 'Sora', 'video'),
('veo', 'Veo', 'video'),
('kling', 'Kling', 'video'),
('pika', 'Pika', 'video'),
('luma', 'Luma', 'video'),
('comfyui', 'ComfyUI', 'image'),
('stable-diffusion', 'Stable Diffusion', 'image'),
('adobe-firefly', 'Adobe Firefly', 'image'),
('elevenlabs', 'ElevenLabs', 'audio'),
('davinci-resolve', 'DaVinci Resolve', 'editing')
ON CONFLICT (id) DO NOTHING;

-- 2. Skills Catalog
INSERT INTO skills (id, name) VALUES
('prompt-engineering', 'Prompt engineering'),
('video-editing', 'Video editing'),
('upscaling', 'Upscaling'),
('lip-sync', 'Lip-sync'),
('motion-design', 'Motion design'),
('3d-rendering', '3D'),
('voice-synthesis', 'Voice synthesis'),
('storyboarding', 'Storyboarding'),
('visual-storytelling', 'Visual storytelling'),
('character-consistency', 'Character consistency')
ON CONFLICT (id) DO NOTHING;

-- 3. Specializations Catalog
INSERT INTO specializations (id, name) VALUES
('ai-filmmaking', 'AI filmmaking'),
('ai-animation', 'AI animation'),
('product-ads', 'Product advertisements'),
('music-videos', 'Music videos'),
('social-shorts', 'Social shorts'),
('explainer-videos', 'Explainer videos'),
('brand-graphics', 'Brand graphics'),
('character-design', 'Character design')
ON CONFLICT (id) DO NOTHING;
