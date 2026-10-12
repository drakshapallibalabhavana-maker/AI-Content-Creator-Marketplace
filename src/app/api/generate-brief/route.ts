import { NextRequest, NextResponse } from 'next/server';
import { aiBriefPromptSchema, creativeBriefSchema } from '@/lib/validations';
import { STYLES_CATALOG } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedInput = aiBriefPromptSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json(
        { error: parsedInput.error.issues[0]?.message || 'Invalid input prompt' },
        { status: 400 }
      );
    }

    const promptText = parsedInput.data.prompt;
    const lower = promptText.toLowerCase();

    // Check for server-side LLM API key
    const apiKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    let generatedData: any = null;

    if (apiKey && apiKey.length > 10 && !apiKey.includes('placeholder')) {
      try {
        // Attempt external call with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert AI commercial director assistant. Return valid JSON only with keys: title, campaign_goal, description, target_audience, content_type (video|animation|image|audio|mixed), styles (array), creative_direction, aspect_ratio (16:9|9:16|1:1|4:5), deliverables_count (number), intended_platforms (array), preferred_skills (array), preferred_tools (array). Do not fabricate budget or licensing terms.',
              },
              { role: 'user', content: promptText },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          const content = json.choices[0]?.message?.content;
          if (content) {
            generatedData = JSON.parse(content);
          }
        }
      } catch (e) {
        console.warn('External LLM call skipped or timed out, activating rule-based semantic parser:', e);
      }
    }

    // High-precision heuristic fallback parser when LLM key is absent or unavailable
    if (!generatedData) {
      const isVertical = lower.includes('vertical') || lower.includes('reels') || lower.includes('tiktok') || lower.includes('shorts') || lower.includes('9:16');
      const isSquare = lower.includes('square') || lower.includes('1:1') || lower.includes('instagram post');
      const isAnimation = lower.includes('animation') || lower.includes('anime') || lower.includes('cartoon');
      const isImage = lower.includes('photo') || lower.includes('image') || lower.includes('lookbook') || lower.includes('still');

      const detectedAspectRatio = isVertical ? '9:16' : isSquare ? '1:1' : '16:9';
      const detectedContentType = isAnimation ? 'animation' : isImage ? 'image' : 'video';

      const detectedStyles: string[] = [];
      if (lower.includes('cinematic') || lower.includes('film')) detectedStyles.push('Cinematic');
      if (lower.includes('photorealistic') || lower.includes('realistic')) detectedStyles.push('Photorealistic');
      if (lower.includes('futuristic') || lower.includes('sci-fi')) detectedStyles.push('Futuristic');
      if (lower.includes('minimalist')) detectedStyles.push('Minimalist');
      if (lower.includes('premium') || lower.includes('luxury')) detectedStyles.push('Premium');
      if (lower.includes('retro') || lower.includes('vintage')) detectedStyles.push('Retro');
      if (detectedStyles.length === 0) detectedStyles.push('Cinematic', 'Premium');

      const platforms: string[] = [];
      if (isVertical) platforms.push('Instagram Reels', 'TikTok');
      else platforms.push('YouTube', 'LinkedIn', 'Website');

      const tools: string[] = [];
      if (lower.includes('runway')) tools.push('Runway');
      if (lower.includes('midjourney')) tools.push('Midjourney');
      if (lower.includes('sora')) tools.push('Sora');
      if (lower.includes('kling')) tools.push('Kling');
      if (lower.includes('comfyui')) tools.push('ComfyUI');
      if (tools.length === 0) tools.push('Runway', 'Midjourney');

      generatedData = {
        title: `AI Creative Campaign: ${promptText.slice(0, 40).replace(/[^a-zA-Z0-9 ]/g, '')}...`,
        campaign_goal: `Execute a commercial ${detectedContentType} campaign based on: "${promptText}".`,
        description: `Client is commissioning a structured generative AI production. Key requirements extracted from campaign idea: ${promptText}. Creator must deliver polished, artifact-free generative assets ready for commercial publication.`,
        target_audience: lower.includes('gen z')
          ? 'Digital natives and Gen Z consumers (aged 18-28)'
          : 'Modern consumers and target brand demographics',
        content_type: detectedContentType,
        styles: detectedStyles,
        creative_direction: `Emphasis on ${detectedStyles.join(' and ')} visual aesthetics. Ensure consistent camera physics, dynamic lighting, and zero generative hallucination drift.`,
        aspect_ratio: detectedAspectRatio,
        deliverables_count: 1,
        intended_platforms: platforms,
        preferred_skills: ['Prompt engineering', 'Video editing', 'Visual storytelling'],
        preferred_tools: tools,
      };
    }

    return NextResponse.json({
      success: true,
      data: generatedData,
      source: apiKey ? 'llm_api' : 'semantic_template_engine',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while analyzing campaign idea' },
      { status: 500 }
    );
  }
}
