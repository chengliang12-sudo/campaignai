export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) return Response.json({ error: 'No image URL' }, { status: 400 });

    const res = await fetch(imageUrl);
    if (!res.ok) return Response.json({ error: 'Failed to fetch image' }, { status: 500 });

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    return Response.json({ base64, contentType });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}