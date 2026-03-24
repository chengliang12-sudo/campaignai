'use client';

import { useAuth } from '../lib/AuthContext';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f6f2', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e0e0e0', padding: '48px 40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a1a' }}>CampaignAI</h1>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '40px', lineHeight: '1.6' }}>
          AI-powered marketing campaign generator.<br />Sign in to get started.
        </p>
        <button
          onClick={signInWithGoogle}
          style={{
            width: '100%', padding: '12px 24px', borderRadius: '8px',
            border: '1px solid #e0e0e0', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            fontSize: '15px', color: '#1a1a1a', cursor: 'pointer',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#f7f6f2'}
          onMouseOut={e => e.currentTarget.style.background = '#fff'}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>
        <p style={{ color: '#bbb', fontSize: '12px', marginTop: '24px' }}>
          Your campaigns are saved to your account.
        </p>
      </div>
    </div>
  );
}