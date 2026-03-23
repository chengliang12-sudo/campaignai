'use client';

import { useState } from 'react';
import { useCampaign } from './hooks/useCampaign';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import BriefInput from './components/BriefInput';
import BriefAnalysis from './components/BriefAnalysis';
import CreativeDirection from './components/CreativeDirection';
import SceneCard from './components/SceneCard';

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const campaign = useCampaign();

  function handleSaveSettings() {
    campaign.saveSettings();
    setShowSettings(false);
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <Header onSettingsClick={() => setShowSettings(s => !s)} />

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
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Building scene storyboard...</div>
      )}

      {campaign.scenes && (
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Scenes</h2>
            {campaign.allScenesReady && (
              <button
                onClick={() => campaign.scenes.forEach(scene => {
                  const media = campaign.sceneMedia[scene.scene_number];
                  if (media?.videoUrl) campaign.downloadClip(scene.scene_number, 'video', media.videoUrl);
                  if (media?.audioUrl) campaign.downloadClip(scene.scene_number, 'audio', media.audioUrl);
                })}
                style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}
              >
                Download all clips
              </button>
            )}
          </div>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            30-second campaign — 3 scenes
            {campaign.falKey && (
              <span style={{ marginLeft: '10px', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: '#eef4ff', color: '#4a6fa5', fontFamily: 'monospace' }}>
                {campaign.providerLabel[campaign.videoProvider]}
              </span>
            )}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {campaign.scenes.map(scene => (
              <SceneCard
                key={scene.scene_number}
                scene={scene}
                media={campaign.sceneMedia[scene.scene_number]}
                generating={campaign.generatingMedia[scene.scene_number]}
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
                hasKeys={!!(campaign.falKey || campaign.elevenLabsKey)}
              />
           ))}

            {/* Add scene — coming soon */}
            <div
              style={{ border: '1px dashed #ddd', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#bbb', cursor: 'not-allowed' }}
            >
              <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
              <span style={{ fontSize: '13px' }}>Add scene — coming soon</span>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}