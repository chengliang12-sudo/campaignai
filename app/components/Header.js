export default function Header({ onSettingsClick, user, onLogout }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <img
            src="/images/efusion_logo.png"
            alt="eFusion"
            style={{ height: '28px', width: 'auto' }}
          />
          <h1 style={{
            fontSize: '22px', fontWeight: '800', margin: 0,
            color: '#0f1729', letterSpacing: '-0.02em',
          }}>
            AIGC<span style={{ color: '#e91e8c' }}>Studio</span>
          </h1>
          <span style={{
            fontSize: '10px', color: '#aaa', fontWeight: '500',
            marginTop: '3px', letterSpacing: '0.04em',
          }}>
            by eFusion
          </span>
        </div>
        <p style={{ color: '#888', margin: 0, fontSize: '13px' }}>
          Turn your marketing brief into a visual storyboard — ready in minutes.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: '24px' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt=""
                style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #e0e0e0' }}
              />
            )}
            <span style={{ fontSize: '13px', color: '#666' }}>{user.displayName}</span>
          </div>
        )}
        <button
          onClick={onSettingsClick}
          style={{
            background: '#f7f7f7', border: '1px solid #ddd', borderRadius: '8px',
            padding: '8px 16px', fontSize: '13px', cursor: 'pointer',
            color: '#333', whiteSpace: 'nowrap',
          }}
        >
          ⚙ Settings
        </button>
        {user && (
          <button
            onClick={onLogout}
            style={{
              background: 'transparent', border: '1px solid #ddd', borderRadius: '8px',
              padding: '8px 16px', fontSize: '13px', cursor: 'pointer',
              color: '#888', whiteSpace: 'nowrap',
            }}
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}