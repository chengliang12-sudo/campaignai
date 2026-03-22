'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [brief, setBrief] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [direction, setDirection] = useState(null);
  const [scenes, setScenes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDirection, setLoadingDirection] = useState(false);
  const [loadingScenes, setLoadingScenes] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [falKey, setFalKey] = useState('');
  const [videoProvider, setVideoProvider] = useState('fal-fast-svd');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [sceneMedia, setSceneMedia] = useState({});
  const [generatingMedia, setGeneratingMedia] = useState({});
  const [editingPrompts, setEditingPrompts] = useState({});

  useEffect(() => {
    setFalKey(localStorage.getItem('fal_api_key') || '');
    setElevenLabsKey(localStorage.getItem('elevenlabs_api_key') || '');
    setVideoProvider(localStorage.getItem('video_provider') || 'fal-fast-svd');
  }, []);

  function saveSettings() {
    localStorage.setItem('fal_api_key', falKey);
    localStorage.setItem('elevenlabs_api_key', elevenLabsKey);
    localStorage.setItem('video_provider', videoProvider);
    setShowSettings(false);
  }

  function updateScenePrompt(sceneNum, newPrompt) {
    setScenes(prev => prev.map(s =>
      s.scene_number === sceneNum ? { ...s, visual_prompt: newPrompt } : s
    ));
  }

  function updateSceneVoiceover(sceneNum, newScript) {
    setScenes(prev => prev.map(s =>
      s.scene_number === sceneNum ? { ...s, voiceover_script: newScript } : s
    ));
  }

  async function handleSubmit() {
    if (!brief.trim()) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setDirection(null);
    setScenes(null);
    setSceneMedia({});
    setEditingPrompts({});

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setAnalysis(data);
      setLoading(false);
      await generateDirection(data);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function generateDirection(analysisData) {
    setLoadingDirection(true);
    try {
      const res = await fetch('/api/direction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: analysisData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Direction generation failed');
      setDirection(data);
      setLoadingDirection(false);
      await generateScenes(analysisData, data);
    } catch (err) {
      setError(err.message);
      setLoadingDirection(false);
    }
  }

  async function generateScenes(analysisData, directionData) {
    setLoadingScenes(true);
    try {
      const res = await fetch('/api/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: analysisData, direction: directionData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scene generation failed');
      setScenes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingScenes(false);
    }
  }

  async function generateSceneMedia(scene) {
    const sceneNum = scene.scene_number;

    if (!falKey && !elevenLabsKey) {
      alert('Please add at least one API key in Settings to generate media.');
      setShowSettings(true);
      return;
    }

    setGeneratingMedia(prev => ({
      ...prev,
      [sceneNum]: { video: !!falKey, audio: !!elevenLabsKey }
    }));

    setSceneMedia(prev => ({ ...prev, [sceneNum]: {} }));

    const results = {};

    if (falKey) {
      try {
        const submitRes = await fetch('/api/generate-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: scene.visual_prompt,
            apiKey: falKey,
            provider: videoProvider,
          }),
        });
        const submitData = await submitRes.json();

        if (submitData.error) {
          results.videoError = submitData.error;
        } else {
          const { requestId, modelPath, provider: prov } = submitData;
          let attempts = 0;
          const maxAttempts = 60;

          while (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 5000));
            attempts++;

            const checkRes = await fetch('/api/check-video', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ requestId, modelPath, provider: prov, apiKey: falKey }),
            });
            const checkData = await checkRes.json();

            if (checkData.status === 'done') {
              results.videoUrl = checkData.videoUrl;
              break;
            }
            if (checkData.status === 'error') {
              results.videoError = checkData.error;
              break;
            }
            if (checkData.queuePosition !== undefined) {
              setGeneratingMedia(prev => ({
                ...prev,
                [sceneNum]: { video: true, audio: false, queuePosition: checkData.queuePosition }
              }));
            }
          }

          if (!results.videoUrl && !results.videoError) {
            results.videoError = 'Timed out after 5 minutes';
          }
        }
      } catch (err) {
        results.videoError = err.message;
      }
    }

    if (elevenLabsKey) {
      try {
        const res = await fetch('/api/generate-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            script: scene.voiceover_script,
            voiceStyle: analysis?.voice_style,
            elevenLabsKey,
          }),
        });
        const data = await res.json();
        if (data.audioUrl) results.audioUrl = data.audioUrl;
        else results.audioError = data.error || 'Audio generation failed';
      } catch (err) {
        results.audioError = err.message;
      }
    }

    setSceneMedia(prev => ({ ...prev, [sceneNum]: results }));
    setGeneratingMedia(prev => ({ ...prev, [sceneNum]: null }));
  }

  function downloadClip(sceneNum, type, url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `scene-${sceneNum}-${type}.${type === 'video' ? 'mp4' : 'mp3'}`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const allScenesReady = scenes && scenes.every(
    s => sceneMedia[s.scene_number]?.videoUrl || sceneMedia[s.scene_number]?.audioUrl
  );

  const labelStyle = {
    fontSize: '11px', textTransform: 'uppercase',
    letterSpacing: '0.08em', color: '#999', marginBottom: '6px'
  };
  const cardStyle = { background: '#f7f7f7', borderRadius: '8px', padding: '16px' };
  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: '13px',
    border: '1px solid #ddd', borderRadius: '6px',
    boxSizing: 'border-box', fontFamily: 'monospace'
  };

  const providerLabel = {
    'fal-fast-svd': 'LTX Video',
    'fal-kling': 'Kling v1.6',
    'fal-minimax': 'Minimax',
    'fal-luma': 'Luma Dream Machine',
    'fal-pika': 'Pika v2.2',
    'luma-direct': 'Luma Direct',
  };

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>CampaignAI</h1>
          <p style={{ color: '#666', margin: 0 }}>Paste your marketing brief below to get started.</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{ background: '#f7f7f7', border: '1px solid #ddd', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', color: '#333' }}
        >
          ⚙ Settings
        </button>
      </div>

      {/* SETTINGS PANEL */}
      {showSettings && (
        <div style={{ background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Your API keys</h3>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px', marginTop: '4px' }}>
            Keys are saved in your browser only — never sent to our servers. You are billed directly by each provider.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>

            {/* VIDEO SETTINGS */}
            <div>
              <div style={labelStyle}>Video model</div>
              <select
                value={videoProvider}
                onChange={(e) => setVideoProvider(e.target.value)}
                style={{ ...inputStyle, fontFamily: 'sans-serif', marginBottom: '10px', cursor: 'pointer' }}
              >
                <optgroup label="Available now">
                  <option value="fal-fast-svd">LTX Video — fast generation</option>
                </optgroup>
                <optgroup label="Coming soon">
                  <option disabled value="">Kling v1.6 — best quality</option>
                  <option disabled value="">Minimax — cinematic</option>
                  <option disabled value="">Luma Dream Machine</option>
                  <option disabled value="">Pika v2.2</option>
                </optgroup>
              </select>

              <div style={labelStyle}>Fal.ai API key</div>
              <input
                type="password"
                value={falKey}
                onChange={(e) => setFalKey(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx:xxxx"
                style={inputStyle}
              />
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                fal.ai/dashboard/keys — one key works for all models
              </div>
            </div>

            {/* AUDIO SETTINGS */}
            <div>
              <div style={labelStyle}>ElevenLabs API key — voiceover</div>
              <input
                type="password"
                value={elevenLabsKey}
                onChange={(e) => setElevenLabsKey(e.target.value)}
                placeholder="sk_xxxxxxxxxxxxxxxx"
                style={inputStyle}
              />
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                elevenlabs.io/app/settings/api-keys — free tier available
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={saveSettings}
              style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', cursor: 'pointer' }}
            >
              Save keys
            </button>
            <button
              onClick={() => setShowSettings(false)}
              style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '14px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '12px', padding: '4px 10px', borderRadius: '20px',
                background: falKey ? '#e8f5e9' : '#f5f5f5',
                color: falKey ? '#2e7d32' : '#aaa',
                border: `1px solid ${falKey ? '#a5d6a7' : '#e0e0e0'}`
              }}>
                {falKey ? `✓ ${providerLabel[videoProvider]} connected` : 'Video not set'}
              </span>
              <span style={{
                fontSize: '12px', padding: '4px 10px', borderRadius: '20px',
                background: elevenLabsKey ? '#e8f5e9' : '#f5f5f5',
                color: elevenLabsKey ? '#2e7d32' : '#aaa',
                border: `1px solid ${elevenLabsKey ? '#a5d6a7' : '#e0e0e0'}`
              }}>
                {elevenLabsKey ? '✓ ElevenLabs connected' : 'Audio not set'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* BRIEF INPUT */}
      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        placeholder="Paste your marketing brief here..."
        style={{
          width: '100%', height: '200px', padding: '16px', fontSize: '15px',
          border: '1px solid #ddd', borderRadius: '8px', resize: 'vertical',
          marginBottom: '16px', boxSizing: 'border-box',
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading || loadingDirection || loadingScenes}
        style={{
          backgroundColor: (loading || loadingDirection || loadingScenes) ? '#999' : '#1a1a1a',
          color: 'white', border: 'none', padding: '12px 28px', fontSize: '15px',
          borderRadius: '8px', cursor: (loading || loadingDirection || loadingScenes) ? 'not-allowed' : 'pointer',
          marginBottom: '40px',
        }}
      >
        {loading ? 'Analyzing brief...'
          : loadingDirection ? 'Generating direction...'
          : loadingScenes ? 'Building scenes...'
          : 'Analyze Brief'}
      </button>

      {error && (
        <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: '#cc0000' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* BRIEF ANALYSIS */}
      {analysis && (
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Brief Analysis</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            {[
              ['Product', analysis.product_name],
              ['Tone', analysis.tone],
              ['CTA', analysis.cta],
              ['Voice style', analysis.voice_style],
              ['Emotion target', analysis.emotion_target],
              ['Age range', analysis.target_audience?.age_range],
            ].map(([label, value]) => (
              <div key={label} style={cardStyle}>
                <div style={labelStyle}>{label}</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{value || '—'}</div>
              </div>
            ))}
          </div>
          <div style={{ ...cardStyle, marginBottom: '12px' }}>
            <div style={labelStyle}>Core message</div>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>{analysis.core_message}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Key differentiators</div>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>{analysis.key_differentiators?.join(', ') || '—'}</div>
          </div>
        </div>
      )}

      {/* CREATIVE DIRECTION */}
      {loadingDirection && !direction && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          Generating creative direction...
        </div>
      )}

      {direction && (
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>Creative Direction</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>The visual world that governs all scenes</p>

          <div style={{ background: '#1a1a1a', color: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
            <div style={{ ...labelStyle, color: '#888' }}>Campaign title</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px' }}>{direction.creative_title}</div>
            <div style={{ ...labelStyle, color: '#888' }}>Narrative arc</div>
            <div style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.7' }}>{direction.narrative_arc}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            {[
              ['Visual world', direction.visual_world],
              ['Cinematography', direction.cinematography_style],
              ['Music direction', direction.music_direction],
              ['Emotion journey', direction.overall_emotion_journey],
            ].map(([label, value]) => (
              <div key={label} style={cardStyle}>
                <div style={labelStyle}>{label}</div>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            {direction.color_palette && Object.entries(direction.color_palette)
              .filter(([k]) => k !== 'mood')
              .map(([key, hex]) => (
                <div key={key} style={{ flex: 1, borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ height: '40px', background: hex, border: '1px solid #eee' }} />
                  <div style={{ background: '#f7f7f7', padding: '6px 8px' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#999' }}>{key}</div>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace' }}>{hex}</div>
                  </div>
                </div>
              ))}
          </div>

          <div style={{ background: '#f0f7f0', border: '1px solid #c8e6c8', borderRadius: '8px', padding: '16px' }}>
            <div style={{ ...labelStyle, color: '#4a7c4a' }}>Master style seed — prepended to every scene prompt</div>
            <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#2d5a2d', lineHeight: '1.7' }}>{direction.master_style_seed}</div>
          </div>
        </div>
      )}

      {/* SCENES */}
      {loadingScenes && !scenes && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          Building scene storyboard...
        </div>
      )}

      {scenes && (
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Scenes</h2>
            {allScenesReady && (
              <button
                onClick={() => {
                  scenes.forEach(scene => {
                    const media = sceneMedia[scene.scene_number];
                    if (media?.videoUrl) downloadClip(scene.scene_number, 'video', media.videoUrl);
                    if (media?.audioUrl) downloadClip(scene.scene_number, 'audio', media.audioUrl);
                  });
                }}
                style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}
              >
                Download all clips
              </button>
            )}
          </div>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            30-second campaign — 3 scenes
            {falKey && (
              <span style={{ marginLeft: '10px', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: '#eef4ff', color: '#4a6fa5', fontFamily: 'monospace' }}>
                {providerLabel[videoProvider]}
              </span>
            )}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {scenes.map((scene) => {
              const sceneNum = scene.scene_number;
              const media = sceneMedia[sceneNum];
              const generating = generatingMedia[sceneNum];
              const isEditingPrompt = editingPrompts[sceneNum];
              const isEditingVo = editingPrompts[`vo_${sceneNum}`];

              return (
                <div key={sceneNum} style={{ border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>

                  {/* Header */}
                  <div style={{ background: '#1a1a1a', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>Scene {sceneNum}</span>
                    <span style={{ background: '#333', color: '#aaa', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                      {scene.duration_seconds}s
                    </span>
                  </div>

                  {/* Emotional beat */}
                  <div style={{ background: '#eef4ff', padding: '6px 16px', borderBottom: '1px solid #e0e0e0' }}>
                    <span style={{ fontSize: '11px', color: '#4a6fa5', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {scene.emotional_beat}
                    </span>
                  </div>

                  {/* Video area */}
                  <div style={{ aspectRatio: '16/9', background: '#111', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {media?.videoUrl ? (
                      <video src={media.videoUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : generating?.video ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '24px', height: '24px', border: '2px solid #333',
                          borderTopColor: '#fff', borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite', margin: '0 auto 8px'
                        }} />
                        <div style={{ fontSize: '11px', color: '#888' }}>Generating video...</div>
                        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>{providerLabel[videoProvider]}</div>
                        {generating?.queuePosition > 0 && (
                          <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>Queue position: {generating.queuePosition}</div>
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#555', fontFamily: 'monospace', lineHeight: '1.5' }}>
                          {scene.visual_prompt.substring(0, 80)}...
                        </div>
                      </div>
                    )}
                    {media?.videoError && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(180,0,0,0.85)', color: '#fff', fontSize: '11px', padding: '6px 10px' }}>
                        {media.videoError}
                      </div>
                    )}
                    {media?.videoUrl && (
                      <button
                        onClick={() => downloadClip(sceneNum, 'video', media.videoUrl)}
                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}
                      >
                        ↓ Download
                      </button>
                    )}
                  </div>

                  <div style={{ padding: '16px' }}>

                    {/* What happens */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={labelStyle}>What happens</div>
                      <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#333' }}>{scene.action_description}</div>
                    </div>

                    {/* Voiceover — editable */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={labelStyle}>Voiceover</div>
                        <button
                          onClick={() => setEditingPrompts(prev => ({ ...prev, [`vo_${sceneNum}`]: !prev[`vo_${sceneNum}`] }))}
                          style={{ background: 'none', border: 'none', fontSize: '11px', color: '#888', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                        >
                          {isEditingVo ? 'Done' : 'Edit'}
                        </button>
                      </div>
                      {isEditingVo ? (
                        <textarea
                          value={scene.voiceover_script}
                          onChange={(e) => updateSceneVoiceover(sceneNum, e.target.value)}
                          style={{ width: '100%', padding: '10px', fontSize: '13px', fontStyle: 'italic', border: '1px solid #4a6fa5', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box', minHeight: '80px', lineHeight: '1.6', color: '#555' }}
                        />
                      ) : (
                        <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#555', fontStyle: 'italic', background: '#fafafa', padding: '10px', borderRadius: '6px', border: '1px solid #eee' }}>
                          "{scene.voiceover_script}"
                        </div>
                      )}
                    </div>

                    {/* Audio player */}
                    {generating?.audio && !media?.audioUrl && (
                      <div style={{ marginBottom: '14px', fontSize: '12px', color: '#888' }}>Generating voiceover...</div>
                    )}
                    {media?.audioUrl && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={labelStyle}>Voiceover audio</div>
                        <audio src={media.audioUrl} controls style={{ width: '100%' }} />
                      </div>
                    )}
                    {media?.audioError && (
                      <div style={{ marginBottom: '14px', fontSize: '12px', color: '#cc0000' }}>
                        Audio: {media.audioError}
                      </div>
                    )}

                    {/* Video prompt — editable */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={labelStyle}>Video prompt</div>
                        <button
                          onClick={() => setEditingPrompts(prev => ({ ...prev, [sceneNum]: !prev[sceneNum] }))}
                          style={{ background: 'none', border: 'none', fontSize: '11px', color: '#888', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                        >
                          {isEditingPrompt ? 'Done' : 'Edit'}
                        </button>
                      </div>
                      {isEditingPrompt ? (
                        <textarea
                          value={scene.visual_prompt}
                          onChange={(e) => updateScenePrompt(sceneNum, e.target.value)}
                          style={{ width: '100%', padding: '10px', fontSize: '11px', fontFamily: 'monospace', border: '1px solid #4a6fa5', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box', minHeight: '100px', lineHeight: '1.6', color: '#333' }}
                        />
                      ) : (
                        <div style={{ fontSize: '11px', lineHeight: '1.6', color: '#666', fontFamily: 'monospace', background: '#f5f5f5', padding: '10px', borderRadius: '6px', border: '1px solid #eee', wordBreak: 'break-word' }}>
                          {scene.visual_prompt.substring(0, 120)}...
                        </div>
                      )}
                    </div>

                    {/* Generate button */}
                    <button
                      onClick={() => generateSceneMedia(scene)}
                      disabled={!!generating}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
                        background: generating ? '#999' : media ? '#2d6a4f' : '#1a1a1a',
                        color: '#fff', fontSize: '13px',
                        cursor: generating ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {generating ? 'Generating...' : media ? 'Regenerate scene' : 'Generate video + audio'}
                    </button>

                    {!falKey && !elevenLabsKey && (
                      <div style={{ fontSize: '11px', color: '#aaa', textAlign: 'center', marginTop: '8px' }}>
                        Add API keys in Settings to generate media
                      </div>
                    )}

                    {scene.transition_to_next && (
                      <div style={{ marginTop: '10px', textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: '#bbb' }}>→ {scene.transition_to_next}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}