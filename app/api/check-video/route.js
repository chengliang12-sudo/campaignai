export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { requestId, modelPath, provider, apiKey } = await request.json();

    if (provider === 'fal') {
      const res = await fetch(
        `https://queue.fal.run/${modelPath}/requests/${requestId}/status`,
        { headers: { 'Authorization': `Key ${apiKey}` } }
      );

      const raw = await res.text();
      let status;
      try { status = JSON.parse(raw); } catch { return Response.json({ status: 'error', error: `Bad response: ${raw.substring(0, 100)}` }); }

      if (status.status === 'COMPLETED') {
        const resultRes = await fetch(
          `https://queue.fal.run/${modelPath}/requests/${requestId}`,
          { headers: { 'Authorization': `Key ${apiKey}` } }
        );
        const result = await resultRes.json();
        const videoUrl =
          result.video?.url ||
          result.video_url ||
          result.videos?.[0]?.url ||
          result.output?.video_url ||
          null;
        if (videoUrl) return Response.json({ status: 'done', videoUrl });
        return Response.json({ status: 'error', error: `No video URL found: ${JSON.stringify(result).substring(0, 200)}` });
      }

      if (status.status === 'FAILED') {
        return Response.json({ status: 'error', error: status.error || 'Generation failed' });
      }

      return Response.json({ status: 'pending', queuePosition: status.queue_position });
    }

    if (provider === 'luma') {
      const res = await fetch(
        `https://api.lumalabs.ai/dream-machine/v1/generations/${requestId}`,
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );
      const data = await res.json();

      if (data.state === 'completed') {
        const videoUrl = data.assets?.video;
        if (videoUrl) return Response.json({ status: 'done', videoUrl });
        return Response.json({ status: 'error', error: 'No video URL in Luma result' });
      }

      if (data.state === 'failed') {
        return Response.json({ status: 'error', error: data.failure_reason || 'Luma failed' });
      }

      return Response.json({ status: 'pending' });
    }

    return Response.json({ status: 'error', error: 'Unknown provider' });

  } catch (err) {
    return Response.json({ status: 'error', error: err.message });
  }
}