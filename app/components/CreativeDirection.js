const labelStyle = { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', marginBottom: '6px' };
const cardStyle = { background: '#f7f7f7', borderRadius: '8px', padding: '16px' };

export default function CreativeDirection({ direction, loading }) {
  if (loading && !direction) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Generating creative direction...</div>;
  }
  if (!direction) return null;

  return (
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
  );
}