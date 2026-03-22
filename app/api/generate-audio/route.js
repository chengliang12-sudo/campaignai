export async function POST(request) {
  try {
    const { script, voiceStyle, elevenLabsKey } = await request.json();

    if (!elevenLabsKey) {
      return Response.json({ error: 'No ElevenLabs API key provided' }, { status: 400 });
    }

    // Use only free tier voices that work without subscription
    const voiceMap = {
      'warm-female': 'cgSgspJ2msm6clMCkdW9',
      'authoritative-male': 'onwK4e9ZLuTAKqWW03F9',
      'energetic-neutral': 'N2lVS1w4EtoT3dr4eOWO',
      'calm-narrator': 'CwhRBWXzGAHq8TQ4Fs17',
      'youthful-female': 'FGY2WhTYpPnrIDTdsKH5',
      'deep-male': 'IKne3meq5aSn9XLyUdCD',
    };

    const voiceId = voiceMap[voiceStyle] || voiceMap['warm-female'];

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: script,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return Response.json({
        error: err.detail?.message || err.detail || JSON.stringify(err)
      }, { status: 500 });
    }

    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64}`;

    return Response.json({ audioUrl });

  } catch (err) {
    console.error('Audio error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}