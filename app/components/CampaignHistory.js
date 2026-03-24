'use client';

import { useEffect, useState } from 'react';
import { getUserCampaigns } from '../lib/campaigns';

export default function CampaignHistory({ user, onSelect, currentId }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserCampaigns(user.uid).then(data => {
      setCampaigns(data);
      setLoading(false);
    });
  }, [user, currentId]);

  if (loading) return (
    <div style={{ padding: '16px', fontSize: '12px', color: '#aaa' }}>Loading...</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <div style={{ flex: 1 }}>
        {campaigns.length === 0 ? (
          <div style={{ padding: '16px', fontSize: '12px', color: '#aaa', lineHeight: '1.6' }}>
            No campaigns yet.<br />Generate one to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {campaigns.map(c => (
              <div
                key={c.id}
                onClick={() => onSelect(c)}
                style={{
                  padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                  background: currentId === c.id ? '#1a1a1a' : 'transparent',
                  color: currentId === c.id ? '#fff' : '#333',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => { if (currentId !== c.id) e.currentTarget.style.background = '#f0ede6'; }}
                onMouseOut={e => { if (currentId !== c.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.productName || 'Untitled'}
                </div>
                <div style={{ fontSize: '11px', color: currentId === c.id ? '#aaa' : '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.creativetitle || '—'}
                </div>
                <div style={{ fontSize: '10px', color: currentId === c.id ? '#888' : '#bbb', marginTop: '2px', fontFamily: 'monospace' }}>
                  {c.createdAt?.toDate?.()?.toLocaleDateString() || ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '12px 14px', borderTop: '1px solid #e0e0e0', marginTop: '8px' }}>
        <p style={{ fontSize: '11px', color: '#bbb', lineHeight: '1.6', margin: 0 }}>
          Campaign prompts and structure are saved. Video and audio assets are not stored — regenerate from saved prompts anytime.
        </p>
      </div>

    </div>
  );
}