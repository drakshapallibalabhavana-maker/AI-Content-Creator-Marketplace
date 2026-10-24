import { NextRequest, NextResponse } from 'next/server';
import { aiBriefPromptSchema } from '@/lib/validations';
import { ContentType, AspectRatio, CommercialRights } from '@/types';

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

    // Check for server-side LLM API key (kept strictly on server)
    const apiKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    let generatedData: any = null;

    if (apiKey && apiKey.length > 10 && !apiKey.includes('placeholder')) {
      try {
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
                  'You are an expert AI commercial director assistant. Return valid JSON only with keys: title, campaign_goal, description, target_audience, content_type (video|animation|image|audio|mixed), styles (array), creative_direction, aspect_ratio (16:9|9:16|1:1|4:5), resolution (4K|1080p), duration_seconds (number|null), deliverables_count (number), intended_platforms (array), intended_usage_rights (organic|paid_media|broadcast), preferred_skills (array), preferred_tools (array). Extract exact numbers or duration from prompt if given.',
              },
              { role: 'user', content: promptText },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
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
        console.warn('External LLM call skipped or timed out, activating deterministic heuristic parser:', e);
      }
    }

    // High-precision heuristic semantic parser when LLM key is absent, times out, or fails
    if (!generatedData) {
      // 1. Content Type detection
      const isMixed = lower.includes('mixed') || (lower.includes('video') && (lower.includes('image') || lower.includes('still') || lower.includes('photo')));
      const isAnimation = lower.includes('animation') || lower.includes('anime') || lower.includes('motion graphics') || lower.includes('3d render');
      const isAudio = lower.includes('audio') || lower.includes('voiceover') || lower.includes('soundtrack') || lower.includes('podcast');
      const isImage = !isMixed && !isAnimation && (lower.includes('photo') || lower.includes('image') || lower.includes('lookbook') || lower.includes('still') || lower.includes('poster'));

      let detectedContentType: ContentType = 'video';
      if (isMixed) detectedContentType = 'mixed';
      else if (isAnimation) detectedContentType = 'animation';
      else if (isAudio) detectedContentType = 'audio';
      else if (isImage) detectedContentType = 'image';

      // 2. Aspect Ratio detection
      const isVertical = lower.includes('vertical') || lower.includes('reels') || lower.includes('tiktok') || lower.includes('shorts') || lower.includes('9:16') || lower.includes('story');
      const isSquare = lower.includes('square') || lower.includes('1:1') || lower.includes('instagram post') || lower.includes('feed');
      const isPortrait = lower.includes('4:5') || lower.includes('portrait');

      let detectedAspectRatio: AspectRatio = '16:9';
      if (isVertical) detectedAspectRatio = '9:16';
      else if (isSquare) detectedAspectRatio = '1:1';
      else if (isPortrait) detectedAspectRatio = '4:5';

      // 3. Duration detection (e.g., 15s, 30 seconds, 60s)
      let detectedDuration: number | undefined = undefined;
      const durationMatch = lower.match(/(\d+)\s*(?:s|sec|seconds|second)\b/);
      if (durationMatch) {
        const parsedSec = parseInt(durationMatch[1], 10);
        if (parsedSec > 0 && parsedSec <= 600) {
          detectedDuration = parsedSec;
        }
      } else if (detectedContentType === 'video' || detectedContentType === 'animation') {
        detectedDuration = isVertical ? 15 : 30;
      }

      // 4. Resolution detection
      let detectedResolution = '4K';
      if (lower.includes('1080p') || lower.includes('fhd') || lower.includes('1080')) {
        detectedResolution = '1080p';
      }

      // 5. Quantity / Deliverables count
      let detectedQuantity = 1;
      const quantityMatch =
        lower.match(/(\d+)\s*(?:[\w-]+\s*){0,4}(?:deliverables?|videos?|clips?|images?|photos?|stills?|teasers?|assets?|pieces?)\b/) ||
        lower.match(/(?:need|produce|deliver|create)\s*(\d+)\b/);
      if (quantityMatch) {
        const parsedQty = parseInt(quantityMatch[1], 10);
        if (parsedQty >= 1 && parsedQty <= 50) {
          detectedQuantity = parsedQty;
        }
      }

      // 6. Commercial Rights detection
      let detectedRights: CommercialRights = 'paid_media';
      if (lower.includes('broadcast') || lower.includes('tv') || lower.includes('television') || lower.includes('national')) {
        detectedRights = 'broadcast';
      } else if (lower.includes('organic') || lower.includes('non-commercial') || lower.includes('social post only')) {
        detectedRights = 'organic';
      }

      // 7. Budget detection (e.g. $1500, $2000 - $4000, $3k)
      let detectedBudgetMin: number | undefined = undefined;
      let detectedBudgetMax: number | undefined = undefined;
      const budgetRangeMatch = lower.match(/\$(\d[\d,]*)\s*(?:-|to)\s*\$?(\d[\d,]*)/);
      if (budgetRangeMatch) {
        const min = parseInt(budgetRangeMatch[1].replace(/,/g, ''), 10);
        const max = parseInt(budgetRangeMatch[2].replace(/,/g, ''), 10);
        if (min >= 100 && max >= min) {
          detectedBudgetMin = min;
          detectedBudgetMax = max;
        }
      } else {
        const singleBudgetMatch = lower.match(/\$(\d[\d,]*)/);
        if (singleBudgetMatch) {
          const val = parseInt(singleBudgetMatch[1].replace(/,/g, ''), 10);
          if (val >= 100) {
            detectedBudgetMin = Math.round(val * 0.8);
            detectedBudgetMax = val;
          }
        }
      }

      // 8. Styles detection
      const detectedStyles: string[] = [];
      if (lower.includes('cinematic') || lower.includes('film') || lower.includes('movie')) detectedStyles.push('Cinematic');
      if (lower.includes('photorealistic') || lower.includes('realistic') || lower.includes('raw')) detectedStyles.push('Photorealistic');
      if (lower.includes('futuristic') || lower.includes('sci-fi') || lower.includes('cyber')) detectedStyles.push('Futuristic');
      if (lower.includes('minimalist') || lower.includes('clean')) detectedStyles.push('Minimalist');
      if (lower.includes('premium') || lower.includes('luxury') || lower.includes('high-end')) detectedStyles.push('Premium');
      if (lower.includes('retro') || lower.includes('vintage') || lower.includes('90s') || lower.includes('80s')) detectedStyles.push('Retro');
      if (lower.includes('vibrant') || lower.includes('colorful') || lower.includes('neon')) detectedStyles.push('Vibrant');
      if (lower.includes('dark') || lower.includes('moody') || lower.includes('noir')) detectedStyles.push('Dark / Moody');
      if (lower.includes('anime') || lower.includes('manga')) detectedStyles.push('Anime');
      if (detectedStyles.length === 0) detectedStyles.push('Cinematic', 'Premium');

      // 9. Platforms detection
      const platforms: string[] = [];
      if (isVertical) {
        platforms.push('Instagram Reels', 'TikTok', 'YouTube Shorts');
      } else if (lower.includes('broadcast') || lower.includes('tv')) {
        platforms.push('Broadcast TV', 'Connected TV', 'YouTube');
      } else {
        platforms.push('YouTube', 'Website', 'Instagram');
      }

      // 10. Tools detection
      const tools: string[] = [];
      if (lower.includes('runway') || lower.includes('gen-3') || lower.includes('gen-2')) tools.push('Runway');
      if (lower.includes('midjourney') || lower.includes('mj')) tools.push('Midjourney');
      if (lower.includes('sora')) tools.push('Sora');
      if (lower.includes('kling')) tools.push('Kling');
      if (lower.includes('comfyui') || lower.includes('comfy')) tools.push('ComfyUI');
      if (lower.includes('elevenlabs') || lower.includes('voice')) tools.push('ElevenLabs');
      if (lower.includes('luma') || lower.includes('dream machine')) tools.push('Luma Dream Machine');
      if (tools.length === 0) tools.push('Runway', 'Midjourney');

      // 11. Target audience interpretation
      let audience = 'Commercial target demographic aligned with brand voice';
      if (lower.includes('gen z') || lower.includes('youth') || lower.includes('teen')) {
        audience = 'Gen Z and digital native audience (aged 18–26) responsive to fast-paced creator content';
      } else if (lower.includes('enterprise') || lower.includes('b2b') || lower.includes('corporate')) {
        audience = 'B2B enterprise executives, industry decision-makers, and corporate partners';
      } else if (lower.includes('athlete') || lower.includes('fitness') || lower.includes('sports')) {
        audience = 'Fitness enthusiasts, competitive athletes, and health-conscious consumers';
      } else if (lower.includes('luxury') || lower.includes('fashion')) {
        audience = 'High-net-worth discerning consumers seeking premium aesthetics and bespoke design';
      }

      // Construct clean title
      const cleanSnippet = promptText
        .slice(0, 45)
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .trim();
      const campaignTitle = `AI Campaign: ${cleanSnippet}...`;

      generatedData = {
        title: campaignTitle,
        campaign_goal: `Produce ${detectedQuantity} commercial-grade ${detectedContentType} asset(s) based on: "${promptText}".`,
        description: `Client is commissioning a structured generative AI production pipeline. Creative directive: ${promptText}. The creator is expected to supply audited workflow manifests, aspect-ratio compliance, and verified commercial license rights.`,
        target_audience: audience,
        content_type: detectedContentType,
        styles: detectedStyles,
        creative_direction: `Style direction highlights ${detectedStyles.join(' and ')} aesthetics with consistent composition, natural physics, and zero hallucination drift.`,
        aspect_ratio: detectedAspectRatio,
        resolution: detectedResolution,
        duration_seconds: detectedDuration,
        deliverables_count: detectedQuantity,
        intended_platforms: platforms,
        intended_usage_rights: detectedRights,
        budget_min: detectedBudgetMin,
        budget_max: detectedBudgetMax,
        preferred_skills: ['Prompt engineering', 'Video editing', 'Visual storytelling', 'Lighting & physics control'],
        preferred_tools: tools,
      };
    }

    // Sanitize and ensure valid schema values
    const validAspectRatios = ['16:9', '9:16', '1:1', '4:5'];
    if (!validAspectRatios.includes(generatedData.aspect_ratio)) {
      generatedData.aspect_ratio = '16:9';
    }

    const validContentTypes = ['video', 'animation', 'image', 'audio', 'mixed'];
    if (!validContentTypes.includes(generatedData.content_type)) {
      generatedData.content_type = 'video';
    }

    const validRights = ['organic', 'paid_media', 'broadcast'];
    if (!validRights.includes(generatedData.intended_usage_rights)) {
      generatedData.intended_usage_rights = 'paid_media';
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
