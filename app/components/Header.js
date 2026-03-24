export default function Header({ onSettingsClick, user, onLogout }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>CampaignAI</h1>
        <p style={{ color: '#666', margin: 0 }}>
          Turn your marketing brief into a visual storyboard — complete with scene direction, animatics, and voiceover scripts. Ready in minutes.
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: '24px' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user.photoURL && (
              <img src={user.photoURL} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #e0e0e0' }} />
            )}
            <span style={{ fontSize: '13px', color: '#666' }}>{user.displayName}</span>
          </div>
        )}
        <button
          onClick={onSettingsClick}
          style={{ background: '#f7f7f7', border: '1px solid #ddd', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', color: '#333', whiteSpace: 'nowrap' }}
        >
          ⚙ Settings
        </button>
        {user && (
          <button
            onClick={onLogout}
            style={{ background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', color: '#888', whiteSpace: 'nowrap' }}
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}