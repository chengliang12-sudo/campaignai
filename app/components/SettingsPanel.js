const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: '13px',
  border: '1px solid #ddd', borderRadius: '6px',
  boxSizing: 'border-box', fontFamily: 'monospace'
};

const labelStyle = {
  fontSize: '11px', textTransform: 'uppercase',
  letterSpacing: '0.08em', color: '#999', marginBottom: '6px'
};

export default function SettingsPanel({
  falKey, setFalKey,
  elevenLabsKey, setElevenLabsKey,
  videoProvider, setVideoProvider,
  providerLabel,
  onSave, onCancel,
}) {
  return (
    <div style={{ background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Your API keys</h3>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px', marginTop: '4px' }}>
        Keys are saved in your browser only — never sent to our servers. You are billed directly by each provider.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
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
          onClick={onSave}
          style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', cursor: 'pointer' }}
        >
          Save keys
        </button>
        <button
          onClick={onCancel}
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
            {falKey ? '✓ Fal.ai connected' : 'Video not set'}
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
  );
}