export const TOOLS_CATALOG = [
  { id: 'midjourney', name: 'Midjourney', category: 'image' },
  { id: 'runway', name: 'Runway', category: 'video' },
  { id: 'sora', name: 'Sora', category: 'video' },
  { id: 'veo', name: 'Veo', category: 'video' },
  { id: 'kling', name: 'Kling', category: 'video' },
  { id: 'pika', name: 'Pika', category: 'video' },
  { id: 'luma', name: 'Luma', category: 'video' },
  { id: 'comfyui', name: 'ComfyUI', category: 'image' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', category: 'image' },
  { id: 'adobe-firefly', name: 'Adobe Firefly', category: 'image' },
  { id: 'elevenlabs', name: 'ElevenLabs', category: 'audio' },
  { id: 'davinci-resolve', name: 'DaVinci Resolve', category: 'editing' },
] as const;

export const SKILLS_CATALOG = [
  { id: 'prompt-engineering', name: 'Prompt engineering' },
  { id: 'video-editing', name: 'Video editing' },
  { id: 'upscaling', name: 'Upscaling' },
  { id: 'lip-sync', name: 'Lip-sync' },
  { id: 'motion-design', name: 'Motion design' },
  { id: '3d-rendering', name: '3D' },
  { id: 'voice-synthesis', name: 'Voice synthesis' },
  { id: 'storyboarding', name: 'Storyboarding' },
  { id: 'visual-storytelling', name: 'Visual storytelling' },
  { id: 'character-consistency', name: 'Character consistency' },
] as const;

export const SPECIALIZATIONS_CATALOG = [
  { id: 'ai-filmmaking', name: 'AI filmmaking' },
  { id: 'ai-animation', name: 'AI animation' },
  { id: 'product-ads', name: 'Product advertisements' },
  { id: 'music-videos', name: 'Music videos' },
  { id: 'social-shorts', name: 'Social shorts' },
  { id: 'explainer-videos', name: 'Explainer videos' },
  { id: 'brand-graphics', name: 'Brand graphics' },
  { id: 'character-design', name: 'Character design' },
] as const;

export const STYLES_CATALOG = [
  'Cinematic',
  'Minimalist',
  'Surreal',
  'Photorealistic',
  'Cartoon',
  'Retro',
  'Futuristic',
  'Editorial',
  'Premium',
  'Playful',
] as const;

export const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:5'] as const;
export const CONTENT_TYPES = ['video', 'animation', 'image', 'audio', 'mixed'] as const;
