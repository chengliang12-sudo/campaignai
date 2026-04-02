'use client';

import { useState } from 'react';

// ── Brand tokens ──────────────────────────────────────
const PINK         = '#e91e8c';
const PINK_LIGHT   = '#fce4f3';
const PINK_BG      = '#fff0f9';
const DARK         = '#1E293B';
const MID          = '#64748B';
const LIGHT_BORDER = '#E2E8F0';
const WHITE        = '#FFFFFF';
const AMBER        = '#D97706';
const AMBER_LIGHT  = '#FEF3C7';

// ── Step definitions ──────────────────────────────────
const steps = [
  { id: 'platform', label: 'Platform', question: 'Where is this campaign going?' },
  { id: 'audience', label: 'Audience', question: 'Who are you trying to reach?' },
  { id: 'format',   label: 'Format',   question: 'What kind of video is this?' },
  { id: 'style',    label: 'Style',    question: 'How should it look and feel?' },
  { id: 'details',  label: 'Details',  question: 'A few final details' },
  { id: 'review',   label: 'Review',   question: "Here's what we'll generate" },
];

// ── Option data ───────────────────────────────────────
const platformOptions = [
  { id: 'tiktok',     label: 'TikTok',                 sub: 'Vertical · 15–60s · Fast pace' },
  { id: 'ig-reels',   label: 'Instagram Reels',        sub: 'Vertical · 15–90s · Visual-first' },
  { id: 'ig-stories', label: 'IG Stories',             sub: 'Vertical · 15s segments' },
  { id: 'yt-shorts',  label: 'YouTube Shorts',         sub: 'Vertical · Up to 60s' },
  { id: 'youtube',    label: 'YouTube',                sub: 'Horizontal · 2–10 min · Detailed' },
  { id: 'linkedin',   label: 'LinkedIn',               sub: 'Horizontal · 30–90s · Professional' },
  { id: 'facebook',   label: 'Facebook',               sub: 'Square or horizontal · Flexible' },
  { id: 'website',    label: 'Website / Landing Page', sub: 'Horizontal · Hero video · Autoplay' },
];

const audienceAge = [
  { id: 'gen-z',       label: 'Gen Z',       sub: '18–27' },
  { id: 'millennials', label: 'Millennials', sub: '28–43' },
  { id: 'gen-x',       label: 'Gen X',       sub: '44–59' },
  { id: 'boomers',     label: 'Boomers',     sub: '60+' },
];

const audienceAwareness = [
  { id: 'cold',     label: 'Never heard of us',        sub: 'Need to introduce who we are' },
  { id: 'warm',     label: "Know us, haven't bought",  sub: 'Need a reason to convert' },
  { id: 'existing', label: 'Existing customer',        sub: 'Re-engage or upsell' },
];

const formatOptions = [
  { id: 'product-showcase', label: 'Product Showcase',           sub: 'Highlight features, show it in use' },
  { id: 'brand-story',      label: 'Brand Story',                sub: 'Who you are, why you exist' },
  { id: 'testimonial',      label: 'Testimonial / Social Proof', sub: 'Customer experience' },
  { id: 'bts',              label: 'Behind the Scenes',          sub: 'Your process, your team' },
  { id: 'tutorial',         label: 'How-To / Tutorial',          sub: 'Teach something useful' },
  { id: 'seasonal',         label: 'Seasonal / Event',           sub: 'CNY, NDP, launch, sale' },
  { id: 'announcement',     label: 'Announcement',               sub: 'New product, location, offer' },
  { id: 'comparison',       label: 'Before / After',             sub: 'Transformation or comparison' },
];

const ambitionOptions = [
  {
    id: 'hero',
    label: 'One-off hero piece',
    sub: 'Single strong narrative, complete story arc',
    arc: 'Build the storyboard as a complete, self-contained narrative with a strong opening, compelling middle, and definitive close.',
  },
  {
    id: 'series',
    label: 'Part of a series',
    sub: 'Leave narrative open, teaser ending',
    arc: 'Structure the storyboard so the narrative feels like one chapter in a larger story — open with context, end with a teaser that invites the next episode.',
  },
  {
    id: 'variations',
    label: 'Testing variations',
    sub: 'Modular scenes, swap-friendly structure',
    arc: 'Design each scene to be modular and independently swappable — avoid over-linking scenes so individual scenes can be tested or replaced without breaking the whole.',
  },
  {
    id: 'always-on',
    label: 'Always-on content',
    sub: 'Repeatable format, consistent structure',
    arc: 'Use a repeatable, templated scene structure that can be refreshed with new content regularly while keeping a consistent format and rhythm.',
  },
];

const toneOptions = [
  { id: 'professional',  label: 'Professional & Polished' },
  { id: 'warm',          label: 'Warm & Personal' },
  { id: 'bold',          label: 'Bold & Energetic' },
  { id: 'playful',       label: 'Fun & Playful' },
  { id: 'calm',          label: 'Calm & Trustworthy' },
  { id: 'inspirational', label: 'Inspirational' },
  { id: 'edgy',          label: 'Edgy & Provocative' },
  { id: 'simple',        label: 'Simple & Direct' },
];

const visualOptions = [
  { id: 'cinematic', label: 'Cinematic / Filmic' },
  { id: 'clean',     label: 'Clean & Minimal' },
  { id: 'bright',    label: 'Bright & Colourful' },
  { id: 'dark',      label: 'Dark & Moody' },
  { id: 'lifestyle', label: 'Lifestyle / Documentary' },
  { id: 'animated',  label: 'Animated / Motion Graphics' },
  { id: 'retro',     label: 'Retro / Vintage' },
  { id: 'lofi',      label: 'Hand-drawn / Lo-fi' },
];

const hookOptions = [
  { id: 'question',  label: 'Start with a question', sub: '"Ever wondered why...?"' },
  { id: 'statement', label: 'Bold statement',        sub: '"This changes everything."' },
  { id: 'surprise',  label: 'Surprising visual',     sub: 'Unexpected opening image' },
  { id: 'problem',   label: 'Relatable problem',     sub: '"We\'ve all been there..."' },
  { id: 'product',   label: 'Lead with the product', sub: 'Show it immediately' },
  { id: 'ai-decide', label: 'Let AI decide',         sub: 'Best fit for your choices' },
];

const ctaOptions = [
  { id: 'website',     label: 'Visit website' },
  { id: 'purchase',    label: 'Buy / Order' },
  { id: 'follow',      label: 'Follow us' },
  { id: 'signup',      label: 'Sign up / Register' },
  { id: 'visit-store', label: 'Visit store' },
  { id: 'share',       label: 'Share this video' },
  { id: 'contact',     label: 'Call / WhatsApp' },
  { id: 'awareness',   label: 'No CTA (awareness only)' },
];

const durationOptions = [
  { id: 'short',    label: 'Under 30s', sub: 'Quick hit' },
  { id: 'standard', label: '30–60s',    sub: 'Standard' },
  { id: 'extended', label: '1–3 min',   sub: 'Extended' },
  { id: 'long',     label: '3+ min',    sub: 'Long form' },
];

// ── Brief assembler ───────────────────────────────────
function getLabel(options, id) {
  return options.find(o => o.id === id)?.label || id;
}

function getArc(id) {
  return ambitionOptions.find(o => o.id === id)?.arc || '';
}

function buildBriefString(selections) {
  const topic     = selections.topic.trim();
  const platform  = selections.platforms.map(p => getLabel(platformOptions, p)).join(', ');
  const age       = selections.ageGroup.map(a => getLabel(audienceAge, a)).join(', ');
  const awareness = getLabel(audienceAwareness, selections.awareness);
  const format    = getLabel(formatOptions, selections.format);
  const arc       = getArc(selections.ambition);
  const tone      = getLabel(toneOptions, selections.tone);
  const visual    = getLabel(visualOptions, selections.visual);
  const hook      = getLabel(hookOptions, selections.hook);
  const cta       = getLabel(ctaOptions, selections.cta);
  const duration  = getLabel(durationOptions, selections.duration);

  return (
    `Campaign topic: ${topic}. ` +
    `Create a 30-second master storyboard for a ${format.toLowerCase()} video campaign targeting ${platform}. ` +
    `Target audience: ${age} — ${awareness.toLowerCase()}. ` +
    `Narrative direction: ${arc} ` +
    `Tone: ${tone.toLowerCase()}. Visual style: ${visual.toLowerCase()}. ` +
    `Open the video with: ${hook.toLowerCase()}. ` +
    `Call to action: ${cta.toLowerCase()}. ` +
    `Target duration for full production: ${duration.toLowerCase()}.`
  );
}

// ── Chip components ───────────────────────────────────
function WideChip({ selected, onClick, children, sub }) {
  return (
    <button
      onClick={onClick}
      className="wizard-wide-chip"
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', justifyContent: 'center',
        padding: '10px 16px', borderRadius: 10,
        border: `1.5px solid ${selected ? PINK : LIGHT_BORDER}`,
        background: selected ? PINK_BG : WHITE,
        cursor: 'pointer', flex: '1 1 45%', minWidth: 180,
        transition: 'all 0.15s', textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color: selected ? PINK : DARK }}>{children}</span>
      {sub && <span style={{ fontSize: 11, color: MID, marginTop: 2 }}>{sub}</span>}
    </button>
  );
}

function SquareChip({ selected, onClick, children, sub }) {
  return (
    <button
      onClick={onClick}
      className="wizard-square-chip"
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '12px 16px', borderRadius: 10,
        border: `1.5px solid ${selected ? PINK : LIGHT_BORDER}`,
        background: selected ? PINK_BG : WHITE,
        cursor: 'pointer', minWidth: 110,
        transition: 'all 0.15s', textAlign: 'center',
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color: selected ? PINK : DARK }}>{children}</span>
      {sub && <span style={{ fontSize: 11, color: MID, marginTop: 2 }}>{sub}</span>}
    </button>
  );
}

function PillChip({ selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px', borderRadius: 20,
        border: `1.5px solid ${selected ? PINK : LIGHT_BORDER}`,
        background: selected ? PINK_BG : WHITE,
        cursor: 'pointer', fontSize: 12,
        fontWeight: selected ? 600 : 400,
        color: selected ? PINK : DARK,
        transition: 'all 0.15s', whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: PINK,
      textTransform: 'uppercase', letterSpacing: 1,
      marginBottom: 8, marginTop: 20,
    }}>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────
export default function PromptBuilderWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({
    topic: '',
    platforms: [],
    ageGroup: [],
    awareness: '',
    format: '',
    ambition: '',
    tone: '',
    visual: '',
    hook: '',
    cta: '',
    duration: '',
  });

  const toggle = (key, val) =>
    setSelections(s => ({
      ...s,
      [key]: s[key].includes(val) ? s[key].filter(v => v !== val) : [...s[key], val],
    }));

  const set = (key, val) =>
    setSelections(s => ({ ...s, [key]: s[key] === val ? '' : val }));

  const canNext =
    step === 0 ? selections.topic.trim().length > 0 && selections.platforms.length > 0 :
    step === 1 ? selections.ageGroup.length > 0 && selections.awareness :
    step === 2 ? selections.format && selections.ambition :
    step === 3 ? selections.tone && selections.visual :
    step === 4 ? selections.hook && selections.cta && selections.duration :
    true;

  const assembledBrief = buildBriefString(selections);

  // ── Step renderers ────────────────────────────────
  const renderStep = () => {
    switch (step) {

      case 0:
        return (
          <div>
            {/* Topic input */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: PINK, textTransform: 'uppercase',
                letterSpacing: 1, marginBottom: 8,
              }}>
                What's your campaign about?
              </label>
              <input
                type="text"
                value={selections.topic}
                onChange={e => setSelections(s => ({ ...s, topic: e.target.value }))}
                placeholder="e.g. New matcha latte launch, summer sale, brand awareness for fintech app"
                style={{
                  width: '100%', padding: '12px 14px',
                  fontSize: 14, borderRadius: 8,
                  border: `1.5px solid ${selections.topic.trim() ? PINK : LIGHT_BORDER}`,
                  outline: 'none', boxSizing: 'border-box',
                  color: DARK, background: WHITE,
                  transition: 'border-color 0.15s',
                }}
              />
              <p style={{ fontSize: 11, color: MID, marginTop: 6, marginBottom: 0 }}>
                This anchors the entire storyboard. Be specific — the more context, the better the output.
              </p>
            </div>

            {/* Platform chips */}
            <SectionLabel>Where will this be posted?</SectionLabel>
            <p style={{ fontSize: 13, color: MID, marginBottom: 12, marginTop: 0 }}>
              Select one or more platforms. Your selections will inform the pacing, framing notes, and scene direction of the master storyboard.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {platformOptions.map(p => (
                <WideChip
                  key={p.id}
                  selected={selections.platforms.includes(p.id)}
                  onClick={() => toggle('platforms', p.id)}
                  sub={p.sub}
                >
                  {p.label}
                </WideChip>
              ))}
            </div>

            {/* Multi-platform notice */}
            {selections.platforms.length > 1 && (
              <div style={{
                marginTop: 16, padding: '10px 14px',
                background: AMBER_LIGHT, borderRadius: 8,
                fontSize: 12, color: AMBER,
              }}>
                <strong>Multiple platforms selected.</strong> We'll generate one master 30-second storyboard. Your platform selections will shape the pacing, aspect ratio notes, and scene direction — you can adapt it for each platform after.
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div>
            <SectionLabel>Age group (select all that apply)</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {audienceAge.map(a => (
                <SquareChip
                  key={a.id}
                  selected={selections.ageGroup.includes(a.id)}
                  onClick={() => toggle('ageGroup', a.id)}
                  sub={a.sub}
                >
                  {a.label}
                </SquareChip>
              ))}
            </div>
            <SectionLabel>How familiar are they with your brand?</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {audienceAwareness.map(a => (
                <WideChip
                  key={a.id}
                  selected={selections.awareness === a.id}
                  onClick={() => set('awareness', a.id)}
                  sub={a.sub}
                >
                  {a.label}
                </WideChip>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <SectionLabel>What kind of video?</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {formatOptions.map(f => (
                <WideChip
                  key={f.id}
                  selected={selections.format === f.id}
                  onClick={() => set('format', f.id)}
                  sub={f.sub}
                >
                  {f.label}
                </WideChip>
              ))}
            </div>

            <SectionLabel>Campaign ambition</SectionLabel>
            <p style={{ fontSize: 12, color: MID, marginTop: 0, marginBottom: 12 }}>
              This shapes the narrative arc of your storyboard — not the number of videos generated. You'll always receive one master 30-second storyboard.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {ambitionOptions.map(a => (
                <WideChip
                  key={a.id}
                  selected={selections.ambition === a.id}
                  onClick={() => set('ambition', a.id)}
                  sub={a.sub}
                >
                  {a.label}
                </WideChip>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <SectionLabel>Tone — how should it sound?</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {toneOptions.map(t => (
                <PillChip
                  key={t.id}
                  selected={selections.tone === t.id}
                  onClick={() => set('tone', t.id)}
                >
                  {t.label}
                </PillChip>
              ))}
            </div>
            <SectionLabel>Visual style — how should it look?</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {visualOptions.map(v => (
                <PillChip
                  key={v.id}
                  selected={selections.visual === v.id}
                  onClick={() => set('visual', v.id)}
                >
                  {v.label}
                </PillChip>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <SectionLabel>How should the video open?</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {hookOptions.map(h => (
                <WideChip
                  key={h.id}
                  selected={selections.hook === h.id}
                  onClick={() => set('hook', h.id)}
                  sub={h.sub}
                >
                  {h.label}
                </WideChip>
              ))}
            </div>

            <SectionLabel>What should viewers do after watching?</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ctaOptions.map(c => (
                <PillChip
                  key={c.id}
                  selected={selections.cta === c.id}
                  onClick={() => set('cta', c.id)}
                >
                  {c.label}
                </PillChip>
              ))}
            </div>

            <SectionLabel>Target duration for full production</SectionLabel>
            <p style={{ fontSize: 12, color: MID, marginTop: 0, marginBottom: 12 }}>
              Your storyboard will always be structured as a 30-second master. This selection captures your intended final production length for your production team's reference.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {durationOptions.map(d => (
                <SquareChip
                  key={d.id}
                  selected={selections.duration === d.id}
                  onClick={() => set('duration', d.id)}
                  sub={d.sub}
                >
                  {d.label}
                </SquareChip>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <p style={{ fontSize: 13, color: MID, marginBottom: 16 }}>
              Review your selections. Click "Use this brief" to edit wording before generating.
            </p>

            {/* Output spec banner */}
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              fontSize: 12, color: '#166534', marginBottom: 16,
            }}>
              <strong>Output:</strong> One master 30-second storyboard · 3 scenes · ~10s per scene
            </div>

            {/* Summary table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                ['Topic',            selections.topic],
                ['Platform',         selections.platforms.map(p => getLabel(platformOptions, p)).join(', ')],
                ['Audience',         `${selections.ageGroup.map(a => getLabel(audienceAge, a)).join(', ')} · ${getLabel(audienceAwareness, selections.awareness)}`],
                ['Format',           getLabel(formatOptions, selections.format)],
                ['Campaign ambition',getLabel(ambitionOptions, selections.ambition)],
                ['Tone',             getLabel(toneOptions, selections.tone)],
                ['Visual Style',     getLabel(visualOptions, selections.visual)],
                ['Hook',             getLabel(hookOptions, selections.hook)],
                ['Call to Action',   getLabel(ctaOptions, selections.cta)],
                ['Target duration',  getLabel(durationOptions, selections.duration)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', borderBottom: `1px solid ${LIGHT_BORDER}`, paddingBottom: 8 }}>
                  <span style={{ width: 140, fontSize: 12, fontWeight: 700, color: PINK, flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 13, color: DARK }}>{value || '—'}</span>
                </div>
              ))}
            </div>

            {/* Assembled brief preview */}
            <div style={{
              padding: '14px 16px', background: PINK_BG,
              borderRadius: 10, border: `1px solid ${PINK_LIGHT}`,
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: PINK, marginBottom: 6, letterSpacing: '0.05em' }}>
                BRIEF THAT WILL BE SENT TO AI
              </div>
              <div style={{ fontSize: 13, color: DARK, lineHeight: 1.6 }}>
                {assembledBrief}
              </div>
            </div>

            <div style={{ fontSize: 12, color: MID }}>
              💡 You can edit this brief directly after clicking "Use this brief" if you want to add product-specific details.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ── Render ────────────────────────────────────────
  return (
    <div style={{ width: '100%' }}>

      {/* Step progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {steps.map((s, i) => (
          <div
            key={s.id}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center',
              cursor: i <= step ? 'pointer' : 'default',
            }}
            onClick={() => { if (i <= step) setStep(i); }}
          >
            <div style={{
              width: '100%', height: 3, borderRadius: 2,
              background: i <= step ? PINK : LIGHT_BORDER,
              marginBottom: 5, transition: 'background 0.2s',
            }} />
            <span
              className="wizard-step-label"
              style={{
                fontSize: 10,
                color: i <= step ? PINK : MID,
                fontWeight: i === step ? 700 : 400,
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Content card */}
      <div
        className="wizard-card"
        style={{
          background: WHITE, borderRadius: 12,
          border: `1px solid ${LIGHT_BORDER}`,
          padding: '24px 24px 20px',
        }}
      >
        <div style={{ fontSize: 11, color: PINK, fontWeight: 700, marginBottom: 4, letterSpacing: '0.05em' }}>
          STEP {step + 1} OF {steps.length}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: DARK, margin: '0 0 18px 0' }}>
          {steps[step].question}
        </h2>
        {renderStep()}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            padding: '10px 20px', borderRadius: 8,
            border: `1px solid ${LIGHT_BORDER}`,
            background: WHITE,
            color: step === 0 ? '#CBD5E1' : DARK,
            cursor: step === 0 ? 'default' : 'pointer',
            fontSize: 13, fontWeight: 500,
          }}
        >
          ← Back
        </button>

        <span style={{ fontSize: 11, color: MID }}>
          {step < 5 && !canNext && (
            step === 0 && !selections.topic.trim()
              ? 'Enter your campaign topic to continue'
              : 'Select an option to continue'
          )}
        </span>

        {step < 5 ? (
          <button
            onClick={() => canNext && setStep(s => s + 1)}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: canNext ? PINK : '#CBD5E1',
              color: WHITE,
              cursor: canNext ? 'pointer' : 'default',
              fontSize: 13, fontWeight: 600,
              opacity: canNext ? 1 : 0.7,
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={() => onComplete(assembledBrief)}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: PINK, color: WHITE,
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}
          >
            Use this brief →
          </button>
        )}
      </div>
    </div>
  );
}