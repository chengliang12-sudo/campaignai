import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { brief } = await request.json();

    if (!brief || brief.trim().length === 0) {
      return Response.json({ error: 'Brief is required' }, { status: 400 });
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a senior marketing strategist. Analyze the provided marketing brief and extract structured information.

Return ONLY a valid JSON object. No preamble, no markdown, no explanation.

Brief:
"""
${brief}
"""

Extract and return this exact JSON structure:
{
  "product_name": "exact product/brand name",
  "product_description": "1-2 sentence product summary",
  "target_audience": {
    "primary": "primary audience descriptor",
    "secondary": null,
    "age_range": "e.g. 25-40 or null",
    "psychographics": ["trait1", "trait2"]
  },
  "core_message": "the single most important message to communicate",
  "supporting_messages": ["message2", "message3"],
  "cta": "primary call to action",
  "tone": "one of: aspirational | authoritative | playful | emotional | urgent | informative | luxury",
  "emotion_target": "primary emotion to evoke in viewer",
  "visual_restrictions": [],
  "brand_colors": [],
  "key_differentiators": ["usp1", "usp2"],
  "voice_style": "one of: warm-female | authoritative-male | energetic-neutral | calm-narrator | youthful-female | deep-male"
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