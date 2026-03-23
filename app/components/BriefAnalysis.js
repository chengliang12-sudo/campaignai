const labelStyle = { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', marginBottom: '6px' };
const cardStyle = { background: '#f7f7f7', borderRadius: '8px', padding: '16px' };

export default function BriefAnalysis({ analysis }) {
  if (!analysis) return null;

  return (
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
  );
}