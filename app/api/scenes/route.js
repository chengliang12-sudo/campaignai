import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { analysis, direction } = await request.json();

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a storyboard director. Break down the creative direction into exactly 3 scenes for a 30-second video.

Brief analysis:
${JSON.stringify(analysis, null, 2)}

Creative direction:
${JSON.stringify(direction, null, 2)}

Rules:
1. Each scene's visual_prompt MUST begin with this exact master_style_seed verbatim: "${direction.master_style_seed}"
2. Scenes form a coherent arc: opening, development, resolution with CTA
3. No talking heads — prompts must work with AI video generation
4. Voiceover max 25 words per scene (10 seconds each)
5. Final scene must include the CTA: "${analysis.cta}"

Return ONLY a valid JSON array of exactly 3 scene objects. No preamble, no markdown:
[
  {
    "scene_number": 1,
    "duration_seconds": 10,
    "emotional_beat": "one word emotion",
    "visual_prompt": "${direction.master_style_seed} [add scene-specific description here]",
    "action_description": "plain English description of what happens, shown to user",
    "voiceover_script": "exact words spoken, max 25 words",
    "voiceover_timing": "starts at 1s, ends at 8s",
    "transition_to_next": "cut | fade | dissolve | match-cut"
  }
]`,
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