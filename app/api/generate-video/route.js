export const maxDuration = 300;
export const dynamic = 'force-dynamic';
export async function POST(request) {
  try {
    const { prompt, provider, apiKey } = await request.json();

    if (!apiKey) {
      return Response.json({ error: 'No API key provided' }, { status: 400 });
    }
    if (!provider) {
      return Response.json({ error: 'No provider selected' }, { status: 400 });
    }

    switch (provider) {
      case 'fal-fast-svd':
        return await falGenerate(prompt, apiKey, 'fal-ai/ltx-video', {
          prompt: prompt,
          aspect_ratio: '16:9',
          duration: 5,
        });

      case 'fal-kling':
        return await falGenerate(prompt, apiKey, 'fal-ai/kling-video/v1.6/standard/text-to-video', {
          prompt,
          duration: '5',
          aspect_ratio: '16:9',
        });

      case 'fal-minimax':
        return await falGenerate(prompt, apiKey, 'fal-ai/minimax-video/image-to-video', {
          prompt,
          image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1280',
        });

      case 'fal-luma':
        return await falGenerate(prompt, apiKey, 'fal-ai/luma-dream-machine', {
          prompt,
          aspect_ratio: '16:9',
        });

      case 'fal-pika':
        return await falGenerate(prompt, apiKey, 'fal-ai/pika/v2.2/text-to-video', {
          prompt,
          aspect_ratio: '16:9',
        });

      case 'luma-direct':
        return await lumaGenerate(prompt, apiKey);

      default:
        return Response.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }

  } catch (err) {
    console.error('Video error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// Generic Fal.ai queue handler — works for any fal model
async function falGenerate(prompt, apiKey, modelPath, body) {
  const submitRes = await fetch(`https://queue.fal.run/${modelPath}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const rawText = await submitRes.text();
  let submitData;
  try {
    submitData = JSON.parse(rawText);
  } catch {
    return Response.json({ error: `Fal response: ${rawText.substring(0, 200)}` }, { status: 500 });
  }

  if (!submitRes.ok) {
    return Response.json({
      error: submitData.message || submitData.detail || submitData.error || JSON.stringify(submitData)
    }, { status: 500 });
  }

  const requestId = submitData.request_id;
  if (!requestId) {
    return Response.json({ error: `No request ID: ${JSON.stringify(submitData)}` }, { status: 500 });
  }

  // Poll for result
  for (let i = 0; i < 36; i++) {
    await new Promise(r => setTimeout(r, 5000));

    const pollRes = await fetch(
      `https://queue.fal.run/${modelPath}/requests/${requestId}/status`,
      { headers: { 'Authorization': `Key ${apiKey}` } }
    );

    let pollData;
    try {
      pollData = await pollRes.json();
    } catch {
      continue;
    }

    if (pollData.status === 'COMPLETED') {
      const resultRes = await fetch(
        `https://queue.fal.run/${modelPath}/requests/${requestId}`,
        { headers: { 'Authorization': `Key ${apiKey}` } }
      );
      const result = await resultRes.json();

      // Different fal models return video in different fields
      const videoUrl =
        result.video?.url ||
        result.video_url ||
        result.videos?.[0]?.url ||
        result.output?.video_url ||
        null;

      if (videoUrl) return Response.json({ videoUrl });
      return Response.json({ error: `No video URL found in result: ${JSON.stringify(result).substring(0, 200)}` }, { status: 500 });
    }

    if (pollData.status === 'FAILED') {
      return Response.json({
        error: `Generation failed: ${pollData.error || pollData.detail || 'unknown reason'}`
      }, { status: 500 });
    }
  }

  return Response.json({ error: 'Timed out waiting for video (3 min)' }, { status: 500 });
}

// Direct Luma API handler
async function lumaGenerate(prompt, apiKey) {
  const submitRes = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: '16:9',
      loop: false,
    }),
  });

  const rawText = await submitRes.text();
  let submitData;
  try {
    submitData = JSON.parse(rawText);
  } catch {
    return Response.json({ error: `Luma response: ${rawText.substring(0, 200)}` }, { status: 500 });
  }

  if (!submitRes.ok) {
    return Response.json({
      error: submitData.message || submitData.detail || JSON.stringify(submitData)
    }, { status: 500 });
  }

  const generationId = submitData.id;

  for (let i = 0; i < 72; i++) {
    await new Promise(r => setTimeout(r, 5000));

    const pollRes = await fetch(
      `https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`,
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );
    const pollData = await pollRes.json();

    if (pollData.state === 'completed') {
      const videoUrl = pollData.assets?.video;
      if (videoUrl) return Response.json({ videoUrl });
      return Response.json({ error: 'No video URL in Luma result' }, { status: 500 });
    }

    if (pollData.state === 'failed') {
      return Response.json({ error: `Luma failed: ${pollData.failure_reason || 'unknown'}` }, { status: 500 });
    }
  }

  return Response.json({ error: 'Timed out' }, { status: 500 });
}