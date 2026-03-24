'use client';

const labelStyle = { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', marginBottom: '6px' };

export default function SceneCard({
  scene, media, generating, isEditingPrompt, isEditingVo,
  providerLabel, videoProvider,
  onGenerate, onDownload,
  onEditPrompt, onEditVo,
  onUpdatePrompt, onUpdateVoiceover,
  hasKeys,
}) {
  const sceneNum = scene.scene_number;

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', background: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* Header bar */}
      <div style={{ background: '#1a1a1a', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
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

      {/* Body — horizontal layout */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* Left — animatic */}
        <div style={{ width: '300px', flexShrink: 0, background: '#111', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '170px' }}>
          {media?.videoUrl ? (
            <video src={media.videoUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : generating?.video ? (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid #333', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
              <div style={{ fontSize: '11px', color: '#888' }}>Generating animatic...</div>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>{providerLabel[videoProvider]}</div>
              {generating?.queuePosition > 0 && (
                <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>Queue: {generating.queuePosition}</div>
              )}
            </div>
          ) : (
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#555', fontFamily: 'monospace', lineHeight: '1.6' }}>
                {scene.visual_prompt.substring(0, 100)}...
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
              onClick={() => onDownload(sceneNum, 'video', media.videoUrl)}
              style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}
            >
              ↓ Download animatic
            </button>
          )}
        </div>

        {/* Right — content */}
        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

            <div>
              <div style={labelStyle}>Scene description</div>
              <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#333' }}>{scene.action_description}</div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={labelStyle}>Voiceover script</div>
                <button onClick={onEditVo} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#888', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
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
                <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#555', fontStyle: 'italic', background: '#fafafa', padding: '8px', borderRadius: '6px', border: '1px solid #eee' }}>
                  "{scene.voiceover_script}"
                </div>
              )}
              {media?.audioUrl && (
                <audio src={media.audioUrl} controls style={{ width: '100%', marginTop: '8px' }} />
              )}
              {generating?.audio && !media?.audioUrl && (
                <div style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>Generating voiceover...</div>
              )}
              {media?.audioError && (
                <div style={{ fontSize: '11px', color: '#cc0000', marginTop: '6px' }}>Audio: {media.audioError}</div>
              )}
            </div>
          </div>

          {/* Animatic prompt */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ display: 'flex', align: 'center', gap: '6px' }}>
                <div style={labelStyle}>Animatic prompt</div>
                <span style={{ fontSize: '10px', color: '#bbb', fontStyle: 'italic', marginBottom: '6px', display: 'block' }}>rough motion reference — not final video quality</span>
              </div>
              <button onClick={onEditPrompt} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#888', cursor: 'pointer', textDecoration: 'underline', padding: 0, flexShrink: 0 }}>
                {isEditingPrompt ? 'Done' : 'Edit'}
              </button>
            </div>
            {isEditingPrompt ? (
              <textarea
                value={scene.visual_prompt}
                onChange={(e) => onUpdatePrompt(sceneNum, e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '11px', fontFamily: 'monospace', border: '1px solid #4a6fa5', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box', minHeight: '80px', lineHeight: '1.6', color: '#333' }}
              />
            ) : (
              <div style={{ fontSize: '11px', lineHeight: '1.6', color: '#666', fontFamily: 'monospace', background: '#f5f5f5', padding: '8px', borderRadius: '6px', border: '1px solid #eee', wordBreak: 'break-word' }}>
                {scene.visual_prompt.substring(0, 180)}...
              </div>
            )}
          </div>

          {/* Bottom row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
            <button
              onClick={() => onGenerate(scene)}
              disabled={!!generating}
              style={{
                padding: '9px 20px', borderRadius: '8px', border: 'none',
                background: generating ? '#999' : media ? '#2d6a4f' : '#1a1a1a',
                color: '#fff', fontSize: '13px',
                cursor: generating ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {generating ? 'Generating...' : media ? 'Regenerate animatic' : 'Generate animatic + voiceover'}
            </button>

            {!hasKeys && (
              <div style={{ fontSize: '11px', color: '#aaa' }}>Add API keys in Settings</div>
            )}

            {scene.transition_to_next && (
              <div style={{ marginLeft: 'auto' }}>
                <span style={{ fontSize: '11px', color: '#bbb' }}>→ {scene.transition_to_next}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}