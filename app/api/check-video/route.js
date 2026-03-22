export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { requestId, modelPath, provider, apiKey } = await request.json();

    if (provider === 'fal') {
      const statusUrl = `https://queue.fal.run/${modelPath}/requests/${requestId}/status`;

      const statusRes = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const raw = await statusRes.text();
      let status;
      try {
        status = JSON.parse(raw);
      } catch {
        return Response.json({ status: 'error', error: `Could not parse: ${raw.substring(0, 200)}` });
      }

      if (!statusRes.ok) {
        return Response.json({ status: 'error', error: `Status check failed (${statusRes.status}): ${JSON.stringify(status).substring(0, 200)}` });
      }

      if (status.status === 'COMPLETED') {
        const resultUrl = `https://queue.fal.run/${modelPath}/requests/${requestId}`;
        const resultRes = await fetch(resultUrl, {
          method: 'GET',
          headers: { 'Authorization': `Key ${apiKey}` },
        });

        const result = await resultRes.json();

        const videoUrl =
          result.video?.url ||
          result.video_url ||
          result.videos?.[0]?.url ||
          result.output?.video_url ||
          result.outputs?.[0]?.url ||
          null;

        if (videoUrl) return Response.json({ status: 'done', videoUrl });
        return Response.json({ status: 'error', error: `No video URL in: ${JSON.stringify(result).substring(0, 300)}` });
      }

      if (status.status === 'FAILED') {
        return Response.json({ status: 'error', error: status.error || status.detail || 'Generation failed' });
      }

      return Response.json({ status: 'pending', queuePosition: status.queue_position, rawStatus: status.status });
    }

    if (provider === 'luma') {
      const res = await fetch(
        `https://api.lumalabs.ai/dream-machine/v1/generations/${requestId}`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${apiKey}` },
        }
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