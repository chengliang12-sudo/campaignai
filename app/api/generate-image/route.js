export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { prompt, apiKey } = await request.json();

    if (!apiKey) return Response.json({ error: 'No API key provided' }, { status: 400 });
    if (!prompt) return Response.json({ error: 'No prompt provided' }, { status: 400 });

    const res = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'landscape_16_9',
        num_inference_steps: 4,
        num_images: 1,
      }),
    });

    const raw = await res.text();
    let submitData;
    try { submitData = JSON.parse(raw); }
    catch { return Response.json({ error: `Fal response: ${raw.substring(0, 200)}` }, { status: 500 }); }

    if (!submitData.request_id) {
      return Response.json({ error: submitData.message || submitData.detail || JSON.stringify(submitData) }, { status: 500 });
    }

    const requestId = submitData.request_id;

    for (let i = 0; i < 24; i++) {
      await new Promise(r => setTimeout(r, 3000));

      const pollRes = await fetch(
        `https://queue.fal.run/fal-ai/flux/schnell/requests/${requestId}/status`,
        { headers: { 'Authorization': `Key ${apiKey}` } }
      );
      const pollData = await pollRes.json();

      if (pollData.status === 'COMPLETED') {
        const resultRes = await fetch(
          `https://queue.fal.run/fal-ai/flux/schnell/requests/${requestId}`,
          { headers: { 'Authorization': `Key ${apiKey}` } }
        );
        const result = await resultRes.json();
        const imageUrl = result.images?.[0]?.url || result.image?.url || null;
        if (imageUrl) return Response.json({ imageUrl });
        return Response.json({ error: `No image URL in result: ${JSON.stringify(result).substring(0, 200)}` }, { status: 500 });
      }

      if (pollData.status === 'FAILED') {
        return Response.json({ error: 'Image generation failed' }, { status: 500 });
      }
    }

    return Response.json({ error: 'Timed out waiting for image' }, { status: 500 });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}