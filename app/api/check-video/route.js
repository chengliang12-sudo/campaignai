export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { requestId, modelPath, provider, apiKey } = await request.json();

    if (provider === 'fal') {
      // Fal uses a universal status endpoint regardless of model
      const statusRes = await fetch(
        `https://queue.fal.run/requests/${requestId}/status`,
        { headers: { 'Authorization': `Key ${apiKey}` } }
      );

      const raw = await statusRes.text();
      let status;
      try {
        status = JSON.parse(raw);
      } catch {
        return Response.json({ status: 'error', error: `Status parse error: ${raw.substring(0, 150)}` });
      }

      if (!statusRes.ok) {
        // Fall back to model-specific endpoint
        const statusRes2 = await fetch(
          `https://queue.fal.run/${modelPath}/requests/${requestId}/status`,
          { headers: { 'Authorization': `Key ${apiKey}` } }
        );
        const raw2 = await statusRes2.text();
        try {
          status = JSON.parse(raw2);
        } catch {
          return Response.json({ status: 'error', error: `Fallback parse error: ${raw2.substring(0, 150)}` });
        }
      }

      if (status.status === 'COMPLETED') {
        // Try universal result endpoint first, then model-specific
        let result;
        const resultRes = await fetch(
          `https://queue.fal.run/requests/${requestId}`,
          { headers: { 'Authorization': `Key ${apiKey}` } }
        );
        if (resultRes.ok) {
          result = await resultRes.json();
        } else {
          const resultRes2 = await fetch(
            `https://queue.fal.run/${modelPath}/requests/${requestId}`,
            { headers: { 'Authorization': `Key ${apiKey}` } }
          );
          result = await resultRes2.json();
        }

        const videoUrl =
          result.video?.url ||
          result.video_url ||
          result.videos?.[0]?.url ||
          result.output?.video_url ||
          result.outputs?.[0]?.url ||
          null;

        if (videoUrl) return Response.json({ status: 'done', videoUrl });
        return Response.json({ status: 'error', error: `No video URL: ${JSON.stringify(result).substring(0, 200)}` });
      }

      if (status.status === 'FAILED') {
        return Response.json({ status: 'error', error: status.error || status.detail || 'Generation failed' });
      }

      if (status.status === 'IN_PROGRESS' || status.status === 'IN_QUEUE') {
        return Response.json({ status: 'pending', queuePosition: status.queue_position });
      }

      // Unknown status — return it so we can see what Fal is saying
      return Response.json({ status: 'pending', debug: JSON.stringify(status).substring(0, 200) });
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