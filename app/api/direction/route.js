import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { analysis } = await request.json();

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `You are a world-class creative director for video advertising. Based on the analyzed marketing brief, create a comprehensive creative direction that will govern all video scenes.

The creative direction must be visually distinctive, consistent across all scenes, appropriate for the tone and audience, and achievable with AI video generation. Avoid directing complex human faces as primary subjects — prefer environments, products, abstract motion, and lifestyle settings.

Brief analysis:
${JSON.stringify(analysis, null, 2)}

Return ONLY a valid JSON object. No preamble, no markdown, no explanation:
{
  "creative_title": "short evocative name for this campaign direction",
  "narrative_arc": "2-3 sentence description of the overarching story told across the video",
  "visual_world": "detailed description of the visual aesthetic — lighting, environment, mood, color treatment",
  "color_palette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "mood": "e.g. warm golden hour"
  },
  "cinematography_style": "camera movement, shot types, pacing",
  "visual_motifs": ["recurring element 1", "recurring element 2"],
  "master_style_seed": "A precise 60-80 word prompt string prepended to every scene video generation prompt. Include: lighting style, color grade, camera style, texture, mood, aspect ratio. Write as if briefing a cinematographer.",
  "music_direction": "background music style, tempo, instrumentation",
  "overall_emotion_journey": "how emotional tone progresses across scenes"
}`,
        },
      ],
    });

    const text = message.content[0].text;
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const json = JSON.parse(cleaned);

    return Response.json(json);
  } catch (err) {
    console.error('Error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}