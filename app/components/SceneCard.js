'use client';

import { useState } from 'react';

const labelStyle = {
  fontSize: '11px', textTransform: 'uppercase',
  letterSpacing: '0.08em', color: '#999', marginBottom: '6px'
};

export default function SceneCard({
  scene, media, generating, isEditingPrompt, isEditingVo,
  sceneImage, generatingImage,
  providerLabel, videoProvider,
  onGenerate, onDownload,
  onEditPrompt, onEditVo,
  onUpdatePrompt, onUpdateVoiceover,
  onRegenerateKeyframe, onRefineScene,
  hasKeys,
}) {
const sceneNum = Number(scene.scene_number);
  const [feedback, setFeedback] = useState('');
  const [refining, setRefining] = useState(false);

  async function handleRefine() {
    if (!feedback.trim()) return;
    setRefining(true);
    await onRefineScene(scene, feedback);
    setFeedback('');
    setRefining(false);
  }

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>

      {/* Header */}
      <div style={{ background: '#1a1a1a', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>Scene {sceneNum}</span>
          <span style={{ background: '#eef4ff', color: '#4a6fa5', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {scene.emotional_beat}
          </span>
        </div>
        <span style={{ background: '#333', color: '#aaa', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
          {scene.duration_seconds}s
        </span>
      </div>

      {/* Body — three columns */}
      <div style={{ display: 'flex', minHeight: '200px' }}>

        {/* LEFT — Keyframe image */}
        <div style={{ width: '260px', flexShrink: 0, background: '#0d0d0d', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {sceneImage?.imageUrl ? (
            <>
              <img
                src={sceneImage.imageUrl}
                alt={`Scene ${sceneNum} keyframe`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <button
                onClick={() => onRegenerateKeyframe(scene)}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}
              >
                ↺ Regenerate
              </button>
              <div style={{ position: 'absolute', bottom: '6px', left: '8px', fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Keyframe
              </div>
            </>
          ) : generatingImage ? (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid #333', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
              <div style={{ fontSize: '10px', color: '#666' }}>Generating keyframe...</div>
            </div>
          ) : (
            <div style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#444', fontFamily: 'monospace', lineHeight: '1.6', marginBottom: '10px' }}>
                {scene.visual_prompt.substring(0, 90)}...
              </div>
              {hasKeys && (
                <button
                  onClick={() => onRegenerateKeyframe(scene)}
                  style={{ background: '#222', color: '#aaa', border: '1px solid #333', borderRadius: '6px', padding: '5px 10px', fontSize: '10px', cursor: 'pointer' }}
                >
                  Generate keyframe
                </button>
              )}
            </div>
          )}
        </div>

        {/* MIDDLE — Scene info + feedback */}
        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0, borderRight: '1px solid #f0f0f0' }}>

          {/* Scene description + voiceover */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={labelStyle}>Scene description</div>
              <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#333' }}>{scene.action_description}</div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={labelStyle}>Voiceover script</div>
                <button onClick={onEditVo} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#aaa', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                  {isEditingVo ? 'Done' : 'Edit'}
                </button>
              </div>
              {isEditingVo ? (
                <textarea
                  value={scene.voiceover_script}
                  onChange={(e) => onUpdateVoiceover(sceneNum, e.target.value)}
                  style={{ width: '100%', padding: '8px', fontSize: '12px', fontStyle: 'italic', border: '1px solid #4a6fa5', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box', minHeight: '70px', lineHeight: '1.6', color: '#555' }}
                />
              ) : (
                <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#666', fontStyle: 'italic', background: '#fafafa', padding: '8px', borderRadius: '6px', border: '1px solid #eee' }}>
                  "{scene.voiceover_script}"
                </div>
              )}
              {media?.audioUrl && (
                <audio src={media.audioUrl} controls style={{ width: '100%', marginTop: '8px' }} />
              )}
              {generating?.audio && !media?.audioUrl && (
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '6px' }}>Generating voiceover...</div>
              )}
              {media?.audioError && (
                <div style={{ fontSize: '11px', color: '#cc0000', marginTop: '6px' }}>Audio: {media.audioError}</div>
              )}
            </div>
          </div>

          {/* Animatic prompt — secondary, muted */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <div style={{ ...labelStyle, marginBottom: 0 }}>Animatic prompt</div>
                <span style={{ fontSize: '10px', color: '#ccc', fontStyle: 'italic' }}>rough motion reference — not final quality</span>
              </div>
              <button onClick={onEditPrompt} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#ccc', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                {isEditingPrompt ? 'Done' : 'Edit'}
              </button>
            </div>
            {isEditingPrompt ? (
              <textarea
                value={scene.visual_prompt}
                onChange={(e) => onUpdatePrompt(sceneNum, e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '11px', fontFamily: 'monospace', border: '1px solid #4a6fa5', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box', minHeight: '70px', lineHeight: '1.6', color: '#555' }}
              />
            ) : (
              <div style={{ fontSize: '11px', lineHeight: '1.6', color: '#bbb', fontFamily: 'monospace', background: '#fafafa', padding: '8px', borderRadius: '6px', border: '1px solid #f0f0f0', wordBreak: 'break-word' }}>
                {scene.visual_prompt.substring(0, 160)}...
              </div>
            )}
          </div>

          {/* User feedback box — primary, prominent */}
          <div style={{ background: '#f7f6f2', borderRadius: '10px', padding: '14px', border: '1px solid #e8e4dc', marginTop: 'auto' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' }}>
              Want to change something?
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
              Describe it in plain language — no prompt engineering needed.
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder='e.g. "make it moodier and darker", "focus more on the product", "less people, more nature"'
              style={{
                width: '100%', padding: '10px 12px', fontSize: '13px',
                border: '1px solid #ddd', borderRadius: '8px', resize: 'vertical',
                boxSizing: 'border-box', minHeight: '70px', lineHeight: '1.6',
                color: '#333', background: '#fff', fontFamily: 'sans-serif',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#1a1a1a'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
            <button
              onClick={handleRefine}
              disabled={refining || !feedback.trim()}
              style={{
                marginTop: '8px', padding: '9px 18px', borderRadius: '8px', border: 'none',
                background: refining || !feedback.trim() ? '#ccc' : '#1a1a1a',
                color: '#fff', fontSize: '13px', fontWeight: '500',
                cursor: refining || !feedback.trim() ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {refining ? 'Updating scene...' : 'Update scene with feedback'}
            </button>
          </div>
        </div>

        {/* RIGHT — Animatic */}
        <div style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Animatic player */}
          <div style={{ flex: 1, background: '#111', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minHeight: '160px' }}>
            {media?.videoUrl ? (
              <video src={media.videoUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : generating?.video ? (
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ width: '20px', height: '20px', border: '2px solid #333', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '10px', color: '#666' }}>Generating animatic...</div>
                {generating?.queuePosition > 0 && (
                  <div style={{ fontSize: '10px', color: '#555', marginTop: '4px' }}>Queue: {generating.queuePosition}</div>
                )}
              </div>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#444', fontFamily: 'monospace', lineHeight: '1.6', marginBottom: '8px' }}>
                  Animatic not yet generated
                </div>
                <div style={{ fontSize: '9px', color: '#333', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Rough motion reference
                </div>
              </div>
            )}
            {media?.videoError && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(180,0,0,0.85)', color: '#fff', fontSize: '10px', padding: '5px 8px' }}>
                {media.videoError}
              </div>
            )}
            {media?.videoUrl && (
              <button
                onClick={() => onDownload(sceneNum, 'video', media.videoUrl)}
                style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '4px', padding: '3px 7px', fontSize: '9px', cursor: 'pointer' }}
              >
                ↓ Download
              </button>
            )}
          </div>

          {/* Animatic generate button */}
          <div style={{ padding: '10px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
            <button
              onClick={() => onGenerate(scene)}
              disabled={!!generating}
              style={{
                width: '100%', padding: '8px', borderRadius: '7px', border: '1px solid #e0e0e0',
                background: generating ? '#f0f0f0' : media?.videoUrl ? '#f0f7f0' : '#fff',
                color: generating ? '#aaa' : media?.videoUrl ? '#2d6a4f' : '#555',
                fontSize: '12px', cursor: generating ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {generating ? 'Generating...' : media?.videoUrl ? '↺ Regenerate animatic' : 'Generate animatic + voiceover'}
            </button>
            {!hasKeys && (
              <div style={{ fontSize: '10px', color: '#bbb', textAlign: 'center', marginTop: '6px' }}>
                Add API keys in Settings
              </div>
            )}
          </div>

          {scene.transition_to_next && (
            <div style={{ padding: '6px 10px', textAlign: 'right' }}>
              <span style={{ fontSize: '10px', color: '#ccc' }}>→ {scene.transition_to_next}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}