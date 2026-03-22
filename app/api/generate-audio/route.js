export async function POST(request) {
  try {
    const { script, voiceStyle, elevenLabsKey } = await request.json();

    if (!elevenLabsKey) {
      return Response.json({ error: 'No ElevenLabs API key provided' }, { status: 400 });
    }

    // Voice ID map based on voice style from brief analysis
    const voiceMap = {
      'warm-female': 'EXAVITQu4vr4xnSDxMaL',
      'authoritative-male': 'TxGEqnHWrfWFTfGW9XjX',
      'energetic-neutral': 'VR6AewLTigWG4xSOukaG',
      'calm-narrator': 'pNInz6obpgDQGcFmaJgB',
      'youthful-female': 'jsCqWAovK2LkecY7zXl4',
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
      return Response.json({ error: err.detail?.message || 'Audio generation failed' }, { status: 500 });
    }

    // Convert audio to base64 to send back to browser
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64}`;

    return Response.json({ audioUrl });

  } catch (err) {
    console.error('Audio error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}