export default function Header({ onSettingsClick }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>CampaignAI</h1>
        <p style={{ color: '#666', margin: 0 }}>Paste your marketing brief below to get started.</p>
      </div>
      <button
        onClick={onSettingsClick}
        style={{ background: '#f7f7f7', border: '1px solid #ddd', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', color: '#333' }}
      >
        ⚙ Settings
      </button>
    </div>
  );
}