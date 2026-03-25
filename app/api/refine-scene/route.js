import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const { scene, userFeedback, masterStyleSeed } = await request.json();

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are a scene editor. Refine the given scene based on the user's plain-English feedback while preserving visual consistency with the master style seed.

Master style seed (must remain at the start of visual_prompt, unchanged):
"${masterStyleSeed}"

Current scene:
${JSON.stringify(scene, null, 2)}

User feedback:
"${userFeedback}"

Rules:
1. visual_prompt MUST still begin with the full master_style_seed string, unchanged
2. Only modify the scene-specific part of visual_prompt after the master_style_seed
3. voiceover_script may be updated if the feedback implies a tone or content change
4. scene_number and duration_seconds must not change
5. Interpret plain English naturally — "moodier" means darker lighting and slower pacing, "more product focus" means closer product shots, etc.

Return ONLY a valid JSON object with these fields:
{
  "visual_prompt": "updated full prompt starting with master_style_seed",
  "voiceover_script": "updated or unchanged voiceover",
  "action_description": "updated or unchanged scene description"
}`,
      }],
    });

    const text = message.content[0].text;
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const json = JSON.parse(cleaned);

    return Response.json(json);

  } catch (err) {
    console.error('Refine scene error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}