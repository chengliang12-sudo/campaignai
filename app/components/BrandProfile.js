'use client';

import { useState, useEffect } from 'react';
import { saveBrandProfile, getBrandProfile } from '../lib/campaigns';

const labelStyle = {
  fontSize: '11px', textTransform: 'uppercase',
  letterSpacing: '0.08em', color: '#999', marginBottom: '6px', display: 'block'
};

const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: '13px',
  border: '1px solid #ddd', borderRadius: '8px',
  boxSizing: 'border-box', fontFamily: 'sans-serif',
  color: '#1a1a1a', background: '#fff', outline: 'none',
  transition: 'border-color 0.15s',
};

export default function BrandProfile({ user, onClose }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    brandName: '',
    brandVoice: '',
    brandRules: '',
    brandGuidelines: '',
  });

  useEffect(() => {
    if (!user) return;
    getBrandProfile(user.uid).then(data => {
      if (data) setProfile({
        brandName: data.brandName || '',
        brandVoice: data.brandVoice || '',
        brandRules: data.brandRules || '',
        brandGuidelines: data.brandGuidelines || '',
      });
      setLoading(false);
    });
  }, [user]);

  function update(field, value) {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await saveBrandProfile(user.uid, profile);
    setSaving(false);
    setSaved(true);
  }

  if (loading) return (
    <div style={{ padding: '40px', color: '#999', fontFamily: 'sans-serif', fontSize: '14px' }}>
      Loading brand profile...
    </div>
  );

  return (
    <div style={{ maxWidth: '640px', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '6px', color: '#1a1a1a' }}>Brand Profile</h2>
          <p style={{ color: '#888', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
            Your brand context is automatically injected into every storyboard you generate — ensuring consistent tone, voice, and messaging across all campaigns.
          </p>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: '20px', color: '#aaa', cursor: 'pointer', padding: '0 4px', flexShrink: 0 }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Brand name */}
        <div>
          <label style={labelStyle}>Brand name</label>
          <input
            type="text"
            value={profile.brandName}
            onChange={e => update('brandName', e.target.value)}
            placeholder="e.g. NovaSkin"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#1a1a1a'}
            onBlur={e => e.target.style.borderColor = '#ddd'}
          />
        </div>

        {/* Brand voice */}
        <div>
          <label style={labelStyle}>Brand voice</label>
          <input
            type="text"
            value={profile.brandVoice}
            onChange={e => update('brandVoice', e.target.value)}
            placeholder='e.g. "warm, confident, never corporate, always human"'
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#1a1a1a'}
            onBlur={e => e.target.style.borderColor = '#ddd'}
          />
          <div style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>
            Describe how your brand speaks and the tone it always maintains.
          </div>
        </div>

        {/* Brand rules */}
        <div>
          <label style={labelStyle}>Brand rules</label>
          <input
            type="text"
            value={profile.brandRules}
            onChange={e => update('brandRules', e.target.value)}
            placeholder='e.g. "never use the word innovative, always mention sustainability"'
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#1a1a1a'}
            onBlur={e => e.target.style.borderColor = '#ddd'}
          />
          <div style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>
            Words to avoid, things to always include, and any hard messaging rules.
          </div>
        </div>

        {/* Brand guidelines */}
        <div>
          <label style={labelStyle}>Brand guidelines</label>
          <textarea
            value={profile.brandGuidelines}
            onChange={e => update('brandGuidelines', e.target.value.slice(0, 2000))}
            placeholder="Paste any relevant brand guidelines, positioning statements, or background context here..."
            style={{
              ...inputStyle, minHeight: '140px', resize: 'vertical',
              lineHeight: '1.6',
            }}
            onFocus={e => e.target.style.borderColor = '#1a1a1a'}
            onBlur={e => e.target.style.borderColor = '#ddd'}
          />
          <div style={{ fontSize: '11px', color: '#bbb', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Optional longer-form brand context. Max 2,000 characters.</span>
            <span style={{ color: profile.brandGuidelines.length > 1800 ? '#cc0000' : '#bbb' }}>
              {profile.brandGuidelines.length} / 2000
            </span>
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '8px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? '#999' : '#1a1a1a', color: '#fff',
              border: 'none', borderRadius: '8px', padding: '11px 28px',
              fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: '500',
            }}
          >
            {saving ? 'Saving...' : 'Save brand profile'}
          </button>
          {saved && (
            <span style={{ fontSize: '13px', color: '#2d6a4f' }}>
              ✓ Saved — will apply to all future storyboards
            </span>
          )}
        </div>
      </div>

      {/* Info box */}
      <div style={{ background: '#f7f6f2', borderRadius: '10px', padding: '16px', marginTop: '32px', border: '1px solid #e8e4dc' }}>
        <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' }}>
          How brand profile works
        </div>
        <p style={{ fontSize: '12px', color: '#888', margin: 0, lineHeight: '1.7' }}>
          When you generate a storyboard, your brand profile is automatically appended to your brief before analysis. This ensures every output — creative direction, scene descriptions, voiceover scripts — reflects your brand voice and follows your brand rules. It also appears in your exported storyboard PDF.
        </p>
      </div>
    </div>
  );
}