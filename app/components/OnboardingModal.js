'use client';

import { useState, useEffect } from 'react';

export default function OnboardingModal({ onComplete, onSave }) {
  const [falKey, setFalKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('onboarding_dismissed');
    const existingFalKey = localStorage.getItem('fal_api_key');
    if (!dismissed && !existingFalKey) {
      setVisible(true);
    }
  }, []);

  function handleSave() {
    if (falKey.trim()) localStorage.setItem('fal_api_key', falKey.trim());
    if (elevenLabsKey.trim()) localStorage.setItem('elevenlabs_api_key', elevenLabsKey.trim());
    localStorage.setItem('onboarding_dismissed', 'true');
    setVisible(false);
    onSave?.({ falKey: falKey.trim(), elevenLabsKey: elevenLabsKey.trim() });
    onComplete?.();
  }

  function handleSkip() {
    localStorage.setItem('onboarding_dismissed', 'true');
    setVisible(false);
    onComplete?.();
  }

  if (!visible) return null;

  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: '13px',
    border: '1px solid #ddd', borderRadius: '8px',
    boxSizing: 'border-box', fontFamily: 'monospace',
    color: '#1a1a1a', background: '#fff', outline: 'none',
  };

  const stepStyle = {
    display: 'flex', gap: '10px', alignItems: 'flex-start',
    marginBottom: '8px',
  };

  const stepNumStyle = {
    width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
    background: '#1a1a1a', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: '700', marginTop: '1px',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        width: '100%', maxWidth: '600px',
        maxHeight: '90vh', overflowY: 'auto',
        padding: '36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
      }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#e91e8c', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Welcome to AIGCStudio
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f1729', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Set up your API keys
          </h2>
          <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: '1.7' }}>
            AIGCStudio uses two free external services to generate images and videos for your storyboard.
            Both are free to sign up — no credit card required to get started.
            If you prefer to skip this for now, you can still generate storyboard text, scripts, and creative direction.
          </p>
        </div>

        {/* Section 1 — Fal.ai */}
        <div style={{
          background: '#fafafa', borderRadius: '12px',
          padding: '20px', marginBottom: '16px',
          border: '1px solid #f0f0f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e91e8c', flexShrink: 0 }} />
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>
              Fal.ai — Keyframe images + Animatics
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 16px 18px' }}>
            Used to generate the keyframe image for each scene and the rough motion animatic video.
          </p>

          <div style={{ marginBottom: '16px' }}>
            {[
              { step: '1', text: 'Open your browser and go to', link: 'https://fal.ai', linkText: 'fal.ai' },
              { step: '2', text: 'Click "Sign Up" in the top right corner. You can sign up with Google — it\'s free and takes 30 seconds.' },
              { step: '3', text: 'Once logged in, click your profile icon in the top right → select "Dashboard".' },
              { step: '4', text: 'In the Dashboard, look for "API Keys" in the left sidebar. Click it.' },
              { step: '5', text: 'Click "Add key" or "Create new key". Give it any name (e.g. "AIGCStudio"). Click Create.' },
              { step: '6', text: 'Your key will appear on screen — it looks like this: xxxxxxxx-xxxx-xxxx-xxxx:xxxx. Copy it and paste it below.' },
            ].map(({ step, text, link, linkText }) => (
              <div key={step} style={stepStyle}>
                <div style={stepNumStyle}>{step}</div>
                <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
                  {text}{' '}
                  {link && (
                    <a href={link} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#e91e8c', textDecoration: 'none', fontWeight: '500' }}>
                      {linkText} ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', marginBottom: '6px', fontWeight: '600' }}>
            Paste your Fal.ai API key here
          </div>
          <input
            type="password"
            value={falKey}
            onChange={e => setFalKey(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx:xxxx"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#e91e8c'}
            onBlur={e => e.target.style.borderColor = '#ddd'}
          />
          {falKey && (
            <div style={{ fontSize: '12px', color: '#2d6a4f', marginTop: '6px' }}>✓ Key entered</div>
          )}
        </div>

        {/* Section 2 — ElevenLabs */}
        <div style={{
          background: '#fafafa', borderRadius: '12px',
          padding: '20px', marginBottom: '24px',
          border: '1px solid #f0f0f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4a6fa5', flexShrink: 0 }} />
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>
              ElevenLabs — Voiceover Audio
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 16px 18px' }}>
            Used to generate the voiceover audio narration for each scene. Free tier included.
          </p>

          <div style={{ marginBottom: '16px' }}>
            {[
              { step: '1', text: 'Open a new tab and go to', link: 'https://elevenlabs.io', linkText: 'elevenlabs.io' },
              { step: '2', text: 'Click "Sign Up" and create a free account. You can use Google sign-in.' },
              { step: '3', text: 'Once logged in, click your profile picture or initial in the top right corner.' },
              { step: '4', text: 'From the dropdown menu, select "Profile + API key" or go to Settings.' },
              { step: '5', text: 'Scroll down to find "API Key". Click the copy icon next to it. Your key starts with "sk_" followed by a long string of letters and numbers.' },
              { step: '6', text: 'Paste the key below. Note: the free tier gives you a limited number of characters per month — enough to test all 3 scenes.' },
            ].map(({ step, text, link, linkText }) => (
              <div key={step} style={stepStyle}>
                <div style={{ ...stepNumStyle, background: '#4a6fa5' }}>{step}</div>
                <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
                  {text}{' '}
                  {link && (
                    <a href={link} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#4a6fa5', textDecoration: 'none', fontWeight: '500' }}>
                      {linkText} ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', marginBottom: '6px', fontWeight: '600' }}>
            Paste your ElevenLabs API key here
          </div>
          <input
            type="password"
            value={elevenLabsKey}
            onChange={e => setElevenLabsKey(e.target.value)}
            placeholder="sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#4a6fa5'}
            onBlur={e => e.target.style.borderColor = '#ddd'}
          />
          {elevenLabsKey && (
            <div style={{ fontSize: '12px', color: '#2d6a4f', marginTop: '6px' }}>✓ Key entered</div>
          )}
        </div>

        {/* Info box */}
        <div style={{
          background: '#fffbeb', border: '1px solid #f5d080',
          borderRadius: '8px', padding: '12px 14px', marginBottom: '24px',
          display: 'flex', gap: '10px', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '14px', flexShrink: 0 }}>🔒</span>
          <p style={{ fontSize: '12px', color: '#92700a', margin: 0, lineHeight: '1.6' }}>
            Your API keys are stored only in your browser and never sent to our servers.
            You are billed directly by Fal.ai and ElevenLabs based on your own usage.
            You can update or remove your keys at any time via the Settings button in the app.
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleSave}
            style={{
              width: '100%', padding: '13px', borderRadius: '10px',
              border: 'none', background: '#1a1a1a', color: '#fff',
              fontSize: '15px', fontWeight: '600', cursor: 'pointer',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#333'}
            onMouseOut={e => e.currentTarget.style.background = '#1a1a1a'}
          >
            {falKey || elevenLabsKey ? 'Save keys & continue' : 'Continue without keys'}
          </button>

          <button
            onClick={handleSkip}
            style={{
              width: '100%', padding: '11px', borderRadius: '10px',
              border: '1px solid #e0e0e0', background: 'transparent',
              color: '#888', fontSize: '13px', cursor: 'pointer',
            }}
          >
            Skip for now — I'll generate storyboard text only
          </button>

          <p style={{ fontSize: '11px', color: '#ccc', textAlign: 'center', margin: 0, lineHeight: '1.6' }}>
            You can add or update your API keys at any time via the ⚙ Settings button in the top right corner.
          </p>
        </div>
      </div>
    </div>
  );
}