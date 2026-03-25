import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const { scenes, brandProfile, analysis } = await request.json();

    // Rule-based banned words check first
    const bannedWords = (brandProfile?.brandRules || '')
      .toLowerCase()
      .match(/never use ["\']?([^"',]+)["\']?/g)
      ?.map(r => r.replace(/never use ["\']?/i, '').replace(/["\']/, '').trim()) || [];

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are a brand compliance evaluator. Evaluate each scene against the brand profile and return a JSON array.

Brand Profile:
- Brand name: ${brandProfile?.brandName || 'Not specified'}
- Brand voice: ${brandProfile?.brandVoice || 'Not specified'}
- Brand rules: ${brandProfile?.brandRules || 'Not specified'}
- Target audience: ${analysis?.target_audience?.primary || 'Not specified'}
- Tone: ${analysis?.tone || 'Not specified'}

Banned words detected by rule check: ${bannedWords.length > 0 ? bannedWords.join(', ') : 'none'}

Scenes to evaluate:
${scenes.map(s => `Scene ${s.scene_number}:
- Description: ${s.action_description}
- Voiceover: ${s.voiceover_script}
- Emotional beat: ${s.emotional_beat}`).join('\n\n')}

For each scene return a JSON object with:
- scene_number (integer)
- brand_score (0-100, where 100 = perfect brand alignment)
- tone_match ("excellent", "good", "fair", "poor")
- issues (array of strings, empty if none)
- risk ("low", "medium", "high")
- suggestion (one sentence improvement tip, or null if score >= 85)

Return ONLY a valid JSON array, no markdown, no preamble.`,
      }],
    });

    const text = message.content[0].text.trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const results = JSON.parse(cleaned);

    const overallScore = Math.round(results.reduce((sum, r) => sum + r.brand_score, 0) / results.length);
    const allIssues = results.flatMap(r => r.issues);
    const highestRisk = results.some(r => r.risk === 'high') ? 'high'
      : results.some(r => r.risk === 'medium') ? 'medium' : 'low';

    return Response.json({
      scenes: results,
      overall: {
        score: overallScore,
        risk: highestRisk,
        issueCount: allIssues.length,
        summary: overallScore >= 85
          ? 'Strong brand alignment across all scenes.'
          : overallScore >= 65
          ? 'Good alignment with minor issues to address.'
          : 'Several brand consistency issues detected — review suggestions below.',
      },
    });

  } catch (err) {
    console.error('BrandGuard error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}