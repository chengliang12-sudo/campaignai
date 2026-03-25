'use client';

import { useState } from 'react';
import { useAuth } from './lib/AuthContext';
import LoginPage from './components/LoginPage';
import { useCampaign } from './hooks/useCampaign';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import BriefInput from './components/BriefInput';
import BriefAnalysis from './components/BriefAnalysis';
import CreativeDirection from './components/CreativeDirection';
import SceneCard from './components/SceneCard';
import CampaignHistory from './components/CampaignHistory';

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const campaign = useCampaign();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#999' }}>
        Loading...
      </div>
    );
  }

  if (!user) return <LoginPage />;

  function handleSaveSettings() {
    campaign.saveSettings();
    setShowSettings(false);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* Sidebar */}
      <div style={{ width: '220px', flexShrink: 0, borderRight: '1px solid #e0e0e0', background: '#fafafa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', fontFamily: 'monospace' }}>My Storyboards</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column' }}>
          <CampaignHistory
            user={user}
            currentId={campaign.campaignId}
            onSelect={(c) => {
              campaign.setBrief(c.brief || '');
              campaign.setAnalysis(c.analysis || null);
              campaign.setDirection(c.direction || null);
              campaign.setScenes(c.scenes || null);
              campaign.setSceneMedia({});
              setNoticeDismissed(false);
            }}
          />
        </div>
      </div>

      {/* Main */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>

        <Header
          onSettingsClick={() => setShowSettings(s => !s)}
          user={user}
          onLogout={logout}
        />

        {showSettings && (
          <SettingsPanel
            falKey={campaign.falKey} setFalKey={campaign.setFalKey}
            elevenLabsKey={campaign.elevenLabsKey} setElevenLabsKey={campaign.setElevenLabsKey}
            videoProvider={campaign.videoProvider} setVideoProvider={campaign.setVideoProvider}
            providerLabel={campaign.providerLabel}
            onSave={handleSaveSettings}
            onCancel={() => setShowSettings(false)}
          />
        )}

        <BriefInput
          brief={campaign.brief}
          setBrief={campaign.setBrief}
          onSubmit={campaign.handleSubmit}
          isGenerating={campaign.isGenerating}
          loading={campaign.loading}
          loadingDirection={campaign.loadingDirection}
          loadingScenes={campaign.loadingScenes}
        />

        {campaign.error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: '#cc0000' }}>
            <strong>Error:</strong> {campaign.error}
          </div>
        )}

        <BriefAnalysis analysis={campaign.analysis} />
        <CreativeDirection direction={campaign.direction} loading={campaign.loadingDirection} />

        {campaign.loadingScenes && !campaign.scenes && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Building your storyboard...
          </div>
        )}

        {campaign.scenes && (
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Your Storyboard</h2>
              {campaign.allScenesReady && (
                <button
                  onClick={() => campaign.scenes.forEach(scene => {
                    const media = campaign.sceneMedia[scene.scene_number];
                    if (media?.videoUrl) campaign.downloadClip(scene.scene_number, 'video', media.videoUrl);
                    if (media?.audioUrl) campaign.downloadClip(scene.scene_number, 'audio', media.audioUrl);
                  })}
                  style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}
                >
                  Download all animatics
                </button>
              )}
            </div>

            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
              30-second campaign — 3 scenes
              {campaign.falKey && (
                <span style={{ marginLeft: '10px', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: '#eef4ff', color: '#4a6fa5', fontFamily: 'monospace' }}>
                  {campaign.providerLabel[campaign.videoProvider]}
                </span>
              )}
            </p>

            {/* Storage notice banner */}
            {!noticeDismissed && (
              <div style={{ background: '#fffbeb', border: '1px solid #f5d080', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>💡</span>
                  <p style={{ fontSize: '13px', color: '#92700a', margin: 0, lineHeight: '1.6' }}>
                    <strong>Your storyboard is saved automatically.</strong> Scene descriptions, voiceover scripts, and creative direction are stored to your account. Animatics and audio are not stored — you can regenerate them anytime from your saved prompts.
                  </p>
                </div>
                <button
                  onClick={() => setNoticeDismissed(true)}
                  style={{ background: 'none', border: 'none', fontSize: '16px', color: '#b8860b', cursor: 'pointer', flexShrink: 0, padding: '0 4px', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {campaign.scenes.map(scene => (
                <SceneCard
                  key={scene.scene_number}
                  scene={scene}
                  media={campaign.sceneMedia[scene.scene_number]}
                  generating={campaign.generatingMedia[scene.scene_number]}
                  sceneImage={campaign.sceneImages[scene.scene_number]}
                  generatingImage={campaign.generatingImages[scene.scene_number]}
                  isEditingPrompt={campaign.editingPrompts[scene.scene_number]}
                  isEditingVo={campaign.editingPrompts[`vo_${scene.scene_number}`]}
                  providerLabel={campaign.providerLabel}
                  videoProvider={campaign.videoProvider}
                  onGenerate={campaign.generateSceneMedia}
                  onDownload={campaign.downloadClip}
                  onEditPrompt={() => campaign.toggleEditPrompt(scene.scene_number)}
                  onEditVo={() => campaign.toggleEditPrompt(`vo_${scene.scene_number}`)}
                  onUpdatePrompt={campaign.updateScenePrompt}
                  onUpdateVoiceover={campaign.updateSceneVoiceover}
                  onRegenerateKeyframe={campaign.generateKeyframe}
                  onRefineScene={campaign.refineScene}
                  hasKeys={!!(campaign.falKey || campaign.elevenLabsKey)}
                />
              ))}

              <div style={{ border: '1px dashed #ddd', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#bbb', cursor: 'not-allowed' }}>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
                <span style={{ fontSize: '13px' }}>Add scene — coming soon</span>
              </div>
            </div>
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    </div>
  );
}