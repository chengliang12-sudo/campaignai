export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { prompt, apiKey } = await request.json();

    if (!apiKey) return Response.json({ error: 'No API key provided' }, { status: 400 });
    if (!prompt) return Response.json({ error: 'No prompt provided' }, { status: 400 });

    // Use direct (non-queue) endpoint for faster image generation
    const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
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
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return Response.json({ error: `Fal response: ${raw.substring(0, 200)}` }, { status: 500 });
    }

    if (!res.ok) {
      return Response.json({
        error: data.message || data.detail || data.error || JSON.stringify(data)
      }, { status: 500 });
    }

    const imageUrl = data.images?.[0]?.url || data.image?.url || null;
    if (imageUrl) return Response.json({ imageUrl });

    return Response.json({
      error: `No image URL found: ${JSON.stringify(data).substring(0, 200)}`
    }, { status: 500 });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}