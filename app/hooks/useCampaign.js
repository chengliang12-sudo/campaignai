'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { saveCampaign, getBrandProfile } from '../lib/campaigns';

export function useCampaign() {
  const { user } = useAuth();
  const [campaignId, setCampaignId] = useState(null);
  const [brief, setBrief] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [direction, setDirection] = useState(null);
  const [scenes, setScenes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDirection, setLoadingDirection] = useState(false);
  const [loadingScenes, setLoadingScenes] = useState(false);
  const [error, setError] = useState(null);
  const [sceneMedia, setSceneMedia] = useState({});
  const [sceneImages, setSceneImages] = useState({});
  const [generatingMedia, setGeneratingMedia] = useState({});
  const [generatingImages, setGeneratingImages] = useState({});
  const [editingPrompts, setEditingPrompts] = useState({});
  const [brandProfile, setBrandProfile] = useState(null);
  const [falKey, setFalKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [videoProvider, setVideoProvider] = useState('fal-fast-svd');

useEffect(() => {
    setFalKey(localStorage.getItem('fal_api_key') || '');
    setElevenLabsKey(localStorage.getItem('elevenlabs_api_key') || '');
    setVideoProvider(localStorage.getItem('video_provider') || 'fal-fast-svd');
  }, []);

  useEffect(() => {
    if (!user) return;
    getBrandProfile(user.uid).then(data => {
      if (data) setBrandProfile(data);
    });
  }, [user]);

  function saveSettings() {
    localStorage.setItem('fal_api_key', falKey);
    localStorage.setItem('elevenlabs_api_key', elevenLabsKey);
    localStorage.setItem('video_provider', videoProvider);
  }

  function updateScenePrompt(sceneNum, newPrompt) {
    setScenes(prev => prev.map(s =>
      Number(s.scene_number) === Number(sceneNum) ? { ...s, visual_prompt: newPrompt } : s
    ));
  }

  function updateSceneVoiceover(sceneNum, newScript) {
    setScenes(prev => prev.map(s =>
      Number(s.scene_number) === Number(sceneNum) ? { ...s, voiceover_script: newScript } : s
    ));
  }

  function toggleEditPrompt(key) {
    setEditingPrompts(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function generateKeyframe(scene) {
    if (!falKey) return;
    const sceneNum = Number(scene.scene_number);

    setGeneratingImages(prev => ({ ...prev, [sceneNum]: true }));

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: scene.visual_prompt, apiKey: falKey }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setSceneImages(prev => ({ ...prev, [sceneNum]: { imageUrl: data.imageUrl } }));
      } else {
        setSceneImages(prev => ({ ...prev, [sceneNum]: { imageError: data.error || 'Image generation failed' } }));
      }
    } catch (err) {
      setSceneImages(prev => ({ ...prev, [sceneNum]: { imageError: err.message } }));
    } finally {
      setGeneratingImages(prev => ({ ...prev, [sceneNum]: false }));
    }
  }

  async function refineScene(scene, userFeedback) {
    if (!userFeedback.trim()) return;
    const sceneNum = Number(scene.scene_number);

    setGeneratingImages(prev => ({ ...prev, [sceneNum]: true }));

    try {
      const res = await fetch('/api/refine-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene,
          userFeedback,
          masterStyleSeed: direction?.master_style_seed || '',
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setScenes(prev => prev.map(s =>
        Number(s.scene_number) === sceneNum ? {
          ...s,
          visual_prompt: data.visual_prompt || s.visual_prompt,
          voiceover_script: data.voiceover_script || s.voiceover_script,
          action_description: data.action_description || s.action_description,
          emotional_beat: data.emotional_beat || s.emotional_beat,
        } : s
      ));

      const updatedScene = {
        ...scene,
        visual_prompt: data.visual_prompt || scene.visual_prompt,
      };
      await generateKeyframe(updatedScene);

    } catch (err) {
      setGeneratingImages(prev => ({ ...prev, [sceneNum]: false }));
      console.error('Refine error:', err);
    }
  }

  async function handleSubmit() {
    if (!brief.trim()) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setDirection(null);
    setScenes(null);
    setSceneMedia({});
    setSceneImages({});
    setEditingPrompts({});
    setCampaignId(null);

    try {
// Append brand profile to brief if available
      let enrichedBrief = brief;
      if (brandProfile?.brandName || brandProfile?.brandVoice || brandProfile?.brandRules || brandProfile?.brandGuidelines) {
        enrichedBrief += '\n\n---\nBRAND CONTEXT (apply to all outputs):\n';
        if (brandProfile.brandName) enrichedBrief += `Brand name: ${brandProfile.brandName}\n`;
        if (brandProfile.brandVoice) enrichedBrief += `Brand voice: ${brandProfile.brandVoice}\n`;
        if (brandProfile.brandRules) enrichedBrief += `Brand rules: ${brandProfile.brandRules}\n`;
        if (brandProfile.brandGuidelines) enrichedBrief += `Brand guidelines: ${brandProfile.brandGuidelines}\n`;
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: enrichedBrief }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setAnalysis(data);
      setLoading(false);
      await generateDirection(data);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function generateDirection(analysisData) {
    setLoadingDirection(true);
    try {
      const res = await fetch('/api/direction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: analysisData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Direction generation failed');
      setDirection(data);
      setLoadingDirection(false);
      await generateScenes(analysisData, data);
    } catch (err) {
      setError(err.message);
      setLoadingDirection(false);
    }
  }

  async function generateScenes(analysisData, directionData) {
    setLoadingScenes(true);
    try {
      const res = await fetch('/api/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: analysisData, direction: directionData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scene generation failed');
      setScenes(data);

      if (user) {
        const id = await saveCampaign(user.uid, {
          brief,
          productName: analysisData?.product_name || 'Untitled',
          creativetitle: directionData?.creative_title || '',
          analysis: analysisData,
          direction: directionData,
          scenes: data,
        });
        if (id) setCampaignId(id);
      }

      if (falKey) {
        data.forEach(scene => generateKeyframe(scene));
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingScenes(false);
    }
  }

  async function generateSceneMedia(scene) {
    const sceneNum = Number(scene.scene_number);
    if (!falKey && !elevenLabsKey) return false;

    setGeneratingMedia(prev => ({
      ...prev,
      [sceneNum]: { video: !!falKey, audio: !!elevenLabsKey }
    }));
    setSceneMedia(prev => ({ ...prev, [sceneNum]: {} }));

    const results = {};

    if (falKey) {
      try {
        const submitRes = await fetch('/api/generate-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: scene.visual_prompt,
            apiKey: falKey,
            provider: videoProvider,
          }),
        });
        const submitData = await submitRes.json();

        if (submitData.error) {
          results.videoError = submitData.error;
        } else {
          const { requestId, modelPath, provider: prov } = submitData;
          let attempts = 0;
          const maxAttempts = 60;

          while (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 5000));
            attempts++;

            const checkRes = await fetch('/api/check-video', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ requestId, modelPath, provider: prov, apiKey: falKey }),
            });
            const checkData = await checkRes.json();

            if (checkData.status === 'done') { results.videoUrl = checkData.videoUrl; break; }
            if (checkData.status === 'error') { results.videoError = checkData.error; break; }
            if (checkData.queuePosition !== undefined) {
              setGeneratingMedia(prev => ({
                ...prev,
                [sceneNum]: { video: true, audio: false, queuePosition: checkData.queuePosition }
              }));
            }
          }

          if (!results.videoUrl && !results.videoError) {
            results.videoError = 'Timed out after 5 minutes';
          }
        }
      } catch (err) {
        results.videoError = err.message;
      }
    }

    if (elevenLabsKey) {
      try {
        const res = await fetch('/api/generate-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            script: scene.voiceover_script,
            voiceStyle: analysis?.voice_style,
            elevenLabsKey,
          }),
        });
        const data = await res.json();
        if (data.audioUrl) results.audioUrl = data.audioUrl;
        else results.audioError = data.error || 'Audio generation failed';
      } catch (err) {
        results.audioError = err.message;
      }
    }

    setSceneMedia(prev => ({ ...prev, [sceneNum]: results }));
    setGeneratingMedia(prev => ({ ...prev, [sceneNum]: null }));
  }

  function downloadClip(sceneNum, type, url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `scene-${sceneNum}-${type}.${type === 'video' ? 'mp4' : 'mp3'}`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const allScenesReady = scenes && scenes.every(
    s => sceneMedia[Number(s.scene_number)]?.videoUrl || sceneMedia[Number(s.scene_number)]?.audioUrl
  );

  const isGenerating = loading || loadingDirection || loadingScenes;

  const providerLabel = {
    'fal-fast-svd': 'LTX Video',
    'fal-kling': 'Kling v1.6',
    'fal-minimax': 'Minimax',
    'fal-luma': 'Luma Dream Machine',
    'fal-pika': 'Pika v2.2',
    'luma-direct': 'Luma Direct',
  };

  return {
    brief, setBrief,
    analysis, setAnalysis,
    direction, setDirection,
    scenes, setScenes,
    loading, loadingDirection, loadingScenes,
    isGenerating, error,
    sceneMedia, setSceneMedia,
    sceneImages, generatingImages,
    generatingMedia,
    editingPrompts,
    falKey, setFalKey,
    elevenLabsKey, setElevenLabsKey,
    videoProvider, setVideoProvider,
    allScenesReady,
    providerLabel,
    campaignId,
    brandProfile,
    handleSubmit,
    saveSettings,
    generateSceneMedia,
    generateKeyframe,
    refineScene,
    updateScenePrompt,
    updateSceneVoiceover,
    toggleEditPrompt,
    downloadClip,
  };
}