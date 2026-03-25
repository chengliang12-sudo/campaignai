'use client';

import { useState } from 'react';

function scoreColor(score) {
  if (score >= 80) return { bg: '#e8f5e9', border: '#a5d6a7', text: '#2d6a4f' };
  if (score >= 60) return { bg: '#fffbeb', border: '#f5d080', text: '#92700a' };
  return { bg: '#fff0f0', border: '#ffcccc', text: '#cc0000' };
}

function riskBadge(risk) {
  if (risk === 'low') return { bg: '#e8f5e9', color: '#2d6a4f', label: 'Low risk' };
  if (risk === 'medium') return { bg: '#fffbeb', color: '#92700a', label: 'Medium risk' };
  return { bg: '#fff0f0', color: '#cc0000', label: 'High risk' };
}

export default function BrandGuard({ scenes, brandProfile, analysis }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  async function runCheck() {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch('/api/brand-guard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes, brandProfile, analysis }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggle(sceneNum) {
    setExpanded(prev => ({ ...prev, [sceneNum]: !prev[sceneNum] }));
  }

  const overallColors = results ? scoreColor(results.overall.score) : null;
  const overallRisk = results ? riskBadge(results.overall.risk) : null;

  return (
    <div style={{ marginBottom: '24px' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: results ? '16px' : '0' }}>
        <button
          onClick={runCheck}
          disabled={loading}
          style={{
            padding: '8px 18px', borderRadius: '8px', border: '1px solid #1a1a1a',
            background: loading ? '#f0f0f0' : '#fff',
            color: loading ? '#aaa' : '#1a1a1a',
            fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <span>🛡</span>
          {loading ? 'Running BrandGuard check...' : results ? 'Re-run BrandGuard' : 'Run BrandGuard check'}
        </button>

        {/* Overall score badge */}
        {results && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: overallColors.bg,
            border: `1px solid ${overallColors.border}`,
            borderRadius: '8px', padding: '6px 14px',
          }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: overallColors.text }}>
              {results.overall.score}
            </span>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: overallColors.text }}>
                Overall brand score
              </div>
              <div style={{ fontSize: '11px', color: overallColors.text, opacity: 0.8 }}>
                {results.overall.summary}
              </div>
            </div>
            <div style={{
              fontSize: '10px', padding: '2px 8px', borderRadius: '4px', marginLeft: '4px',
              background: overallRisk.bg, color: overallRisk.color,
            }}>
              {overallRisk.label}
            </div>
          </div>
        )}

        {error && (
          <div style={{ fontSize: '13px', color: '#cc0000' }}>Error: {error}</div>
        )}
      </div>

      {/* Per-scene results */}
      {results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {results.scenes.map(scene => {
            const colors = scoreColor(scene.brand_score);
            const risk = riskBadge(scene.risk);
            const isOpen = expanded[scene.scene_number];

            return (
              <div
                key={scene.scene_number}
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px', overflow: 'hidden',
                  background: colors.bg,
                }}
              >
                {/* Scene row */}
                <div
                  onClick={() => toggle(scene.scene_number)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '600', color: colors.text, minWidth: '60px' }}>
                    Scene {scene.scene_number}
                  </span>

                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: colors.text }}>
                    {scene.brand_score}
                  </span>

                  <span style={{ fontSize: '11px', color: colors.text, textTransform: 'capitalize' }}>
                    Tone: {scene.tone_match}
                  </span>

                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
                    background: risk.bg, color: risk.color,
                  }}>
                    {risk.label}
                  </span>

                  {scene.issues.length > 0 && (
                    <span style={{ fontSize: '11px', color: colors.text }}>
                      {scene.issues.length} issue{scene.issues.length > 1 ? 's' : ''}
                    </span>
                  )}

                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: colors.text }}>
                    {isOpen ? '▲' : '▼'}
                  </span>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ padding: '0 14px 12px', borderTop: `1px solid ${colors.border}` }}>
                    {scene.issues.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: colors.text, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Issues
                        </div>
                        {scene.issues.map((issue, i) => (
                          <div key={i} style={{ fontSize: '12px', color: colors.text, marginBottom: '3px' }}>
                            · {issue}
                          </div>
                        ))}
                      </div>
                    )}
                    {scene.suggestion && (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: colors.text, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Suggestion
                        </div>
                        <div style={{ fontSize: '12px', color: colors.text, fontStyle: 'italic' }}>
                          {scene.suggestion}
                        </div>
                      </div>
                    )}
                    {scene.issues.length === 0 && !scene.suggestion && (
                      <div style={{ fontSize: '12px', color: colors.text, marginTop: '10px', fontStyle: 'italic' }}>
                        No issues detected — strong brand alignment.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}