'use client';

import { useState, useEffect } from 'react';
import PromptBuilderWizard from './PromptBuilderWizard';

export default function BriefInput({ brief, setBrief, onSubmit, isGenerating, loading, loadingDirection, loadingScenes }) {
  const [consent, setConsent] = useState(false);
  const [mode, setMode] = useState('wizard'); // 'wizard' | 'freeform'

  // Reset consent and mode when brief is cleared (new storyboard)
  useEffect(() => {
    if (!brief) {
      setConsent(false);
      setMode('wizard');
    }
  }, [brief]);

  function handleWizardComplete(briefString) {
    setBrief(briefString);
    setMode('freeform'); // drop into freeform so user can review/edit before generating
  }

  function handleSubmit() {
    if (!consent) return;
    localStorage.setItem('last_consent', JSON.stringify({
      timestamp: new Date().toISOString(),
      sessionId: Math.random().toString(36).substring(2),
    }));
    onSubmit();
  }

  const canSubmit = consent && !isGenerating && brief.trim();

  return (
    <div style={{ marginBottom: '8px' }}>

      {/* ── Mode toggle ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setMode('wizard')}
          className="brief-mode-toggle"
          style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
            fontWeight: mode === 'wizard' ? 600 : 400,
            border: `1.5px solid ${mode === 'wizard' ? '#e91e8c' : '#e0e0e0'}`,
            background: mode === 'wizard' ? '#fff0f9' : '#fff',
            color: mode === 'wizard' ? '#e91e8c' : '#555',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          ✦ Build with wizard
        </button>
        <button
          onClick={() => setMode('freeform')}
          className="brief-mode-toggle"
          style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
            fontWeight: mode === 'freeform' ? 600 : 400,
            border: `1.5px solid ${mode === 'freeform' ? '#e91e8c' : '#e0e0e0'}`,
            background: mode === 'freeform' ? '#fff0f9' : '#fff',
            color: mode === 'freeform' ? '#e91e8c' : '#555',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          ✍ Write my own brief
        </button>
      </div>

      {/* ── Wizard mode ── */}
      {mode === 'wizard' && (
        <PromptBuilderWizard onComplete={handleWizardComplete} />
      )}

      {/* ── Freeform mode ── */}
      {mode === 'freeform' && (
        <div>

          {/* Brief populated by wizard — show subtle notice */}
          {brief.trim() && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: '8px',
              background: '#fff0f9', border: '1px solid #fce4f3',
              marginBottom: '12px', gap: '12px',
            }}>
              <span style={{ fontSize: '12px', color: '#e91e8c' }}>
                ✦ Brief populated by wizard — edit freely before generating.
              </span>
              <button
                onClick={() => { setBrief(''); setMode('wizard'); }}
                style={{
                  background: 'none', border: 'none', fontSize: '12px',
                  color: '#e91e8c', cursor: 'pointer', flexShrink: 0,
                  textDecoration: 'underline', padding: 0,
                }}
              >
                Start over
              </button>
            </div>
          )}

          <textarea
            value={brief}
            onChange={e => setBrief(e.target.value)}
            placeholder="Paste your marketing brief here..."
            style={{
              width: '100%', height: '200px', padding: '16px', fontSize: '15px',
              border: '1px solid #ddd', borderRadius: '8px', resize: 'vertical',
              marginBottom: '16px', boxSizing: 'border-box',
            }}
          />

          {/* Consent checkbox */}
          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            marginBottom: '16px', cursor: 'pointer',
            padding: '12px 14px', borderRadius: '8px',
            background: consent ? '#f0f7f0' : '#fafafa',
            border: `1px solid ${consent ? '#a5d6a7' : '#e0e0e0'}`,
            transition: 'all 0.15s',
          }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              style={{ marginTop: '2px', width: '15px', height: '15px', flexShrink: 0, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
              I confirm that this brief does not contain sensitive or personal data
              (such as individual names, email addresses, or phone numbers) that is
              not intended for marketing use. I understand that submitted content will
              be processed by AI to generate campaign storyboards.
            </span>
          </label>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              backgroundColor: !canSubmit ? '#ccc' : '#1a1a1a',
              color: 'white', border: 'none', padding: '12px 28px', fontSize: '15px',
              borderRadius: '8px', cursor: !canSubmit ? 'not-allowed' : 'pointer',
              marginBottom: '40px', transition: 'background 0.15s',
            }}
          >
            {loading ? 'Reading your brief...'
              : loadingDirection ? 'Writing creative direction...'
              : loadingScenes ? 'Building your storyboard...'
              : 'Generate Storyboard'}
          </button>

          {!consent && brief.trim() && (
            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '-32px', marginBottom: '32px' }}>
              Please confirm the above before generating.
            </div>
          )}

        </div>
      )}
    </div>
  );
}