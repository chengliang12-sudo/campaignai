export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { prompt, provider, apiKey } = await request.json();

    if (!apiKey) return Response.json({ error: 'No API key provided' }, { status: 400 });
    if (!provider) return Response.json({ error: 'No provider selected' }, { status: 400 });

    switch (provider) {
      case 'fal-fast-svd':
        return await falSubmit(apiKey, 'fal-ai/ltx-video', { prompt, aspect_ratio: '16:9', duration: 5 });
      case 'fal-kling':
        return await falSubmit(apiKey, 'fal-ai/kling-video/v1.6/standard/text-to-video', { prompt, duration: '5', aspect_ratio: '16:9' });
      case 'fal-minimax':
        return await falSubmit(apiKey, 'fal-ai/minimax-video/image-to-video', { prompt, image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1280' });
      case 'fal-luma':
        return await falSubmit(apiKey, 'fal-ai/luma-dream-machine', { prompt, aspect_ratio: '16:9' });
      case 'fal-pika':
        return await falSubmit(apiKey, 'fal-ai/pika/v2.2/text-to-video', { prompt, aspect_ratio: '16:9' });
      case 'luma-direct':
        return await lumaSubmit(apiKey, prompt);
      default:
        return Response.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }

  } catch (err) {
    console.error('Video submit error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

async function falSubmit(apiKey, modelPath, body) {
  const res = await fetch(`https://queue.fal.run/${modelPath}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  let data;
  try { data = JSON.parse(raw); } catch { return Response.json({ error: `Fal: ${raw.substring(0, 200)}` }, { status: 500 }); }
  if (!res.ok) return Response.json({ error: data.message || data.detail || JSON.stringify(data) }, { status: 500 });
  if (!data.request_id) return Response.json({ error: `No request_id: ${JSON.stringify(data)}` }, { status: 500 });

  return Response.json({ requestId: data.request_id, modelPath, provider: 'fal' });
}

async function lumaSubmit(apiKey, prompt) {
  const res = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspect_ratio: '16:9', loop: false }),
  });

  const raw = await res.text();
  let data;
  try { data = JSON.parse(raw); } catch { return Response.json({ error: `Luma: ${raw.substring(0, 200)}` }, { status: 500 }); }
  if (!res.ok) return Response.json({ error: data.message || data.detail || JSON.stringify(data) }, { status: 500 });
  if (!data.id) return Response.json({ error: `No generation id: ${JSON.stringify(data)}` }, { status: 500 });

  return Response.json({ requestId: data.id, provider: 'luma' });
}