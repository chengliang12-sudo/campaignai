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
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>

      <div style={{ background: '#1a1a1a', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>Scene {sceneNum}</span>
        <span style={{ background: '#333', color: '#aaa', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
          {scene.duration_seconds}s
        </span>
      </div>

      <div style={{ background: '#eef4ff', padding: '6px 16px', borderBottom: '1px solid #e0e0e0' }}>
        <span style={{ fontSize: '11px', color: '#4a6fa5', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {scene.emotional_beat}
        </span>
      </div>

      <div style={{ aspectRatio: '16/9', background: '#111', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {media?.videoUrl ? (
          <video src={media.videoUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : generating?.video ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '24px', height: '24px', border: '2px solid #333', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
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
            onClick={() => onDownload(sceneNum, 'video', media.videoUrl)}
            style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}
          >
            ↓ Download
          </button>
        )}
      </div>

      <div style={{ padding: '16px' }}>

        <div style={{ marginBottom: '14px' }}>
          <div style={labelStyle}>What happens</div>
          <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#333' }}>{scene.action_description}</div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={labelStyle}>Voiceover</div>
            <button onClick={onEditVo} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#888', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
              {isEditingVo ? 'Done' : 'Edit'}
            </button>
          </div>
          {isEditingVo ? (
            <textarea
              value={scene.voiceover_script}
              onChange={(e) => onUpdateVoiceover(sceneNum, e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '13px', fontStyle: 'italic', border: '1px solid #4a6fa5', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box', minHeight: '80px', lineHeight: '1.6', color: '#555' }}
            />
          ) : (
            <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#555', fontStyle: 'italic', background: '#fafafa', padding: '10px', borderRadius: '6px', border: '1px solid #eee' }}>
              "{scene.voiceover_script}"
            </div>
          )}
        </div>

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
          <div style={{ marginBottom: '14px', fontSize: '12px', color: '#cc0000' }}>Audio: {media.audioError}</div>
        )}

        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={labelStyle}>Video prompt</div>
            <button onClick={onEditPrompt} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#888', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
              {isEditingPrompt ? 'Done' : 'Edit'}
            </button>
          </div>
          {isEditingPrompt ? (
            <textarea
              value={scene.visual_prompt}
              onChange={(e) => onUpdatePrompt(sceneNum, e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '11px', fontFamily: 'monospace', border: '1px solid #4a6fa5', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box', minHeight: '100px', lineHeight: '1.6', color: '#333' }}
            />
          ) : (
            <div style={{ fontSize: '11px', lineHeight: '1.6', color: '#666', fontFamily: 'monospace', background: '#f5f5f5', padding: '10px', borderRadius: '6px', border: '1px solid #eee', wordBreak: 'break-word' }}>
              {scene.visual_prompt.substring(0, 120)}...
            </div>
          )}
        </div>

        <button
          onClick={() => onGenerate(scene)}
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

        {!hasKeys && (
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
}