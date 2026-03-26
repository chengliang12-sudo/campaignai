'use client';

import { useAuth } from '../lib/AuthContext';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Segoe UI", -apple-system, sans-serif',
      background: '#f8f8f8',
    }}>

      {/* Left panel — branding */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f1729 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '32px 28px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '280px',
      }}>
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(233,30,140,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(233,30,140,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div>
          <img
            src="/images/efusion_logo.svg"
            alt="eFusion Technology"
            style={{ height: '44px', width: 'auto' }}
          />
        </div>

        {/* Headline */}
        <div>
          <div style={{
            display: 'inline-block',
            background: 'rgba(233,30,140,0.15)',
            border: '1px solid rgba(233,30,140,0.3)',
            borderRadius: '4px',
            padding: '4px 12px',
            marginBottom: '24px',
          }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#e91e8c', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              AI-Powered Marketing
            </span>
          </div>

          <h1 style={{
            fontSize: '42px', fontWeight: '800', color: '#ffffff',
            lineHeight: '1.1', margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}>
            AIGC<span style={{ color: '#e91e8c' }}>Studio</span>
          </h1>

          <p style={{
            fontSize: '15px', color: 'rgba(255,255,255,0.55)',
            lineHeight: '1.7', margin: '16px 0 0',
            maxWidth: '360px',
          }}>
            Turn your marketing brief into a production-ready visual storyboard — complete with scene direction, animatics, and voiceover scripts.
          </p>

          <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              'AI-generated campaign storyboards in minutes',
              'Keyframe images + animatic motion references',
              'Brand consistency enforced across all outputs',
            ].map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(233,30,140,0.2)',
                  border: '1px solid rgba(233,30,140,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#e91e8c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline — hidden on mobile, visible on desktop */}
        <div className="login-tagline" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            Powered by eFusion Technology · Singapore · 21 Years in Digital Solutions
          </p>
        </div>
      </div>

      {/* Right panel — login */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        background: '#ffffff',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '26px', fontWeight: '700', color: '#0f1729',
              margin: '0 0 10px', letterSpacing: '-0.02em',
            }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: '1.6' }}>
              Sign in to access your storyboard workspace and campaign history.
            </p>
          </div>

          <button
            onClick={signInWithGoogle}
            style={{
              width: '100%', padding: '14px 20px',
              borderRadius: '10px', border: '1.5px solid #e0e0e0',
              background: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              fontSize: '15px', fontWeight: '500', color: '#1a1a1a',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = '#e91e8c';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(233,30,140,0.12)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = '#e0e0e0';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '28px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
            <span style={{ fontSize: '11px', color: '#ccc', letterSpacing: '0.08em' }}>SECURE LOGIN</span>
            <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
          </div>

          <div style={{
            background: '#fafafa', borderRadius: '10px',
            padding: '16px 18px', border: '1px solid #f0f0f0',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                ['🔒', 'Data stored securely in Singapore (Firebase)'],
                ['💾', 'Storyboards saved automatically to your account'],
                ['🛡', 'Brand compliance checking on every output'],
              ].map(([icon, text], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: '12px', color: '#888', lineHeight: '1.4' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            fontSize: '12px', color: '#bbb', textAlign: 'center',
            marginTop: '28px', lineHeight: '1.6',
          }}>
            By signing in you agree to our terms of use.{' '}
            <a href="https://www.efusiontech.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#e91e8c', textDecoration: 'none' }}
            >
              efusiontech.com
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}