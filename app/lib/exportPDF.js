import { jsPDF } from 'jspdf';

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

const COLORS = {
  black: [26, 25, 23],
  dark: [40, 40, 40],
  muted: [120, 116, 110],
  hint: [180, 175, 168],
  border: [224, 221, 214],
  bg: [247, 246, 242],
  white: [255, 255, 255],
  accent: [26, 25, 23],
};

function setColor(doc, color, type = 'text') {
  if (type === 'text') doc.setTextColor(...color);
  else if (type === 'fill') doc.setFillColor(...color);
  else if (type === 'draw') doc.setDrawColor(...color);
}

function label(doc, text, x, y) {
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.hint);
  doc.text(text.toUpperCase(), x, y);
}

function body(doc, text, x, y, maxWidth) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.dark);
  const lines = doc.splitTextToSize(text || '—', maxWidth);
  doc.text(lines, x, y);
  return lines.length * 5;
}

function heading(doc, text, x, y, size = 18) {
  doc.setFontSize(size);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.black);
  doc.text(text || '', x, y);
}

function divider(doc, y) {
  setColor(doc, COLORS.border, 'draw');
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
}

async function fetchImageAsBase64(imageUrl) {
  try {
    const res = await fetch('/api/proxy-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    const data = await res.json();
    if (data.base64) return `data:${data.contentType};base64,${data.base64}`;
    return null;
  } catch {
    return null;
  }
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] : [200, 200, 200];
}

export async function exportStoryboardPDF({ analysis, direction, scenes, sceneImages, brief }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // ── PAGE 1 — COVER ──────────────────────────────────────────
  setColor(doc, COLORS.black, 'fill');
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // Logo placeholder — white box centered
  const logoW = 48;
  const logoH = 14;
  const logoX = (PAGE_W - logoW) / 2;
  const logoY = PAGE_H / 2 - 30;
  setColor(doc, COLORS.white, 'fill');
  doc.roundedRect(logoX, logoY, logoW, logoH, 3, 3, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.black);
  doc.text('CampaignAI', PAGE_W / 2, logoY + 9.5, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  setColor(doc, [160, 155, 148]);
  doc.text('Campaign Storyboard', PAGE_W / 2, logoY + 28, { align: 'center' });

  doc.setFontSize(8);
  setColor(doc, [100, 96, 90]);
  doc.text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), PAGE_W / 2, logoY + 38, { align: 'center' });

  // ── PAGE 2 — CAMPAIGN OVERVIEW ──────────────────────────────
  doc.addPage();

  let y = MARGIN + 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.hint);
  doc.text('CAMPAIGN OVERVIEW', MARGIN, y);
  y += 12;

  heading(doc, direction?.creative_title || 'Untitled Campaign', MARGIN, y, 24);
  y += 10;

  divider(doc, y);
  y += 10;

  // Product name
  label(doc, 'Product', MARGIN, y);
  y += 5;
  const prodH = body(doc, analysis?.product_name || '—', MARGIN, y, CONTENT_W);
  y += prodH + 8;

  // Original brief
  label(doc, 'Original Brief', MARGIN, y);
  y += 5;
  const briefH = body(doc, brief || '—', MARGIN, y, CONTENT_W);
  y += briefH + 8;

  divider(doc, y);
  y += 10;

  // Product description
  label(doc, 'Product Description', MARGIN, y);
  y += 5;
  const descH = body(doc, analysis?.product_description || '—', MARGIN, y, CONTENT_W);
  y += descH + 8;

  // Core message
  label(doc, 'Core Message', MARGIN, y);
  y += 5;
  const coreH = body(doc, analysis?.core_message || '—', MARGIN, y, CONTENT_W);
  y += coreH + 8;

  // CTA
  label(doc, 'Call to Action', MARGIN, y);
  y += 5;
  body(doc, analysis?.cta || '—', MARGIN, y, CONTENT_W);

  // ── PAGE 3 — CREATIVE DIRECTION ─────────────────────────────
  doc.addPage();
  y = MARGIN + 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.hint);
  doc.text('CREATIVE DIRECTION', MARGIN, y);
  y += 12;

  heading(doc, 'What we understood from your brief', MARGIN, y, 14);
  y += 10;

  divider(doc, y);
  y += 10;

  // Two column grid for brief understanding
  const colW = (CONTENT_W - 8) / 2;
  const leftX = MARGIN;
  const rightX = MARGIN + colW + 8;

  const fields = [
    ['Tone', analysis?.tone],
    ['Target Audience', analysis?.target_audience?.primary],
    ['Age Range', analysis?.target_audience?.age_range],
    ['Emotion Target', analysis?.emotion_target],
    ['Voice Style', analysis?.voice_style],
    ['Key Differentiators', analysis?.key_differentiators?.join(', ')],
  ];

  let leftY = y;
  let rightY = y;

  fields.forEach(([ lbl, val ], i) => {
    const col = i % 2 === 0 ? leftX : rightX;
    const curY = i % 2 === 0 ? leftY : rightY;

    label(doc, lbl, col, curY);
    const h = body(doc, val || '—', col, curY + 5, colW);

    if (i % 2 === 0) leftY += h + 14;
    else rightY += h + 14;
  });

  y = Math.max(leftY, rightY) + 4;
  divider(doc, y);
  y += 10;

  // Narrative arc
  label(doc, 'Narrative Arc', MARGIN, y);
  y += 5;
  const arcH = body(doc, direction?.narrative_arc || '—', MARGIN, y, CONTENT_W);
  y += arcH + 10;

  // Emotion journey
  label(doc, 'Emotion Journey', MARGIN, y);
  y += 5;
  const journeyH = body(doc, direction?.overall_emotion_journey || '—', MARGIN, y, CONTENT_W);
  y += journeyH + 10;

  divider(doc, y);
  y += 10;

  // Color palette
  label(doc, 'Color Palette', MARGIN, y);
  y += 6;

  if (direction?.color_palette) {
    const swatchSize = 14;
    const swatchGap = 6;
    let swatchX = MARGIN;

    Object.entries(direction.color_palette)
      .filter(([k]) => k !== 'mood')
      .forEach(([key, hex]) => {
        const rgb = hexToRgb(hex);
        setColor(doc, rgb, 'fill');
        setColor(doc, COLORS.border, 'draw');
        doc.setLineWidth(0.2);
        doc.roundedRect(swatchX, y, swatchSize, swatchSize, 2, 2, 'FD');

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        setColor(doc, COLORS.muted);
        doc.text(key.toUpperCase(), swatchX, y + swatchSize + 4);
        doc.text(hex, swatchX, y + swatchSize + 8);

        swatchX += swatchSize + swatchGap + 16;
      });

    y += swatchSize + 16;
  }

  // Mood
  if (direction?.color_palette?.mood) {
    label(doc, 'Palette Mood', MARGIN, y);
    y += 5;
    body(doc, direction.color_palette.mood, MARGIN, y, CONTENT_W);
    y += 10;
  }

  divider(doc, y);
  y += 10;

  // Master style seed
  label(doc, 'Master Style Seed', MARGIN, y);
  y += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  setColor(doc, COLORS.muted);
  const seedLines = doc.splitTextToSize(direction?.master_style_seed || '—', CONTENT_W);
  doc.text(seedLines, MARGIN, y);

  // ── PAGES 4+ — SCENES ───────────────────────────────────────
  for (const scene of scenes) {
    doc.addPage();
    y = MARGIN;

    const sceneNum = Number(scene.scene_number);
    const imageData = sceneImages?.[sceneNum]?.imageUrl
      ? await fetchImageAsBase64(sceneImages[sceneNum].imageUrl)
      : null;

    // Keyframe image — full width 16:9
    const imgH = (CONTENT_W * 9) / 16;

    if (imageData) {
      try {
        doc.addImage(imageData, 'JPEG', MARGIN, y, CONTENT_W, imgH, undefined, 'FAST');
      } catch {
        setColor(doc, COLORS.bg, 'fill');
        setColor(doc, COLORS.border, 'draw');
        doc.roundedRect(MARGIN, y, CONTENT_W, imgH, 3, 3, 'FD');
        doc.setFontSize(9);
        setColor(doc, COLORS.hint);
        doc.text('Keyframe not available', PAGE_W / 2, y + imgH / 2, { align: 'center' });
      }
    } else {
      setColor(doc, COLORS.bg, 'fill');
      setColor(doc, COLORS.border, 'draw');
      doc.setLineWidth(0.3);
      doc.roundedRect(MARGIN, y, CONTENT_W, imgH, 3, 3, 'FD');
      doc.setFontSize(9);
      setColor(doc, COLORS.hint);
      doc.text('Keyframe not generated', PAGE_W / 2, y + imgH / 2, { align: 'center' });
    }

    y += imgH + 8;

    // Scene header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    setColor(doc, COLORS.black);
    doc.text(`Scene ${sceneNum}`, MARGIN, y);

    // Emotional beat pill
    const beatText = (scene.emotional_beat || '').toUpperCase();
    doc.setFontSize(7);
    const beatW = doc.getTextWidth(beatText) + 6;
    setColor(doc, [238, 244, 255], 'fill');
    doc.roundedRect(MARGIN + 28, y - 5, beatW, 6, 1.5, 1.5, 'F');
    setColor(doc, [74, 111, 165]);
    doc.text(beatText, MARGIN + 31, y - 0.5);

    // Duration
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLORS.muted);
    doc.text(`${scene.duration_seconds}s`, PAGE_W - MARGIN, y, { align: 'right' });

    y += 8;
    divider(doc, y);
    y += 8;

    // Two column — scene description + voiceover
    label(doc, 'Scene Description', leftX, y);
    label(doc, 'Voiceover Script', rightX, y);
    y += 5;

    const descLines = doc.splitTextToSize(scene.action_description || '—', colW);
    const voLines = doc.splitTextToSize(`"${scene.voiceover_script || '—'}"`, colW);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLORS.dark);
    doc.text(descLines, leftX, y);

    doc.setFont('helvetica', 'italic');
    setColor(doc, [100, 96, 92]);
    doc.text(voLines, rightX, y);

    y += Math.max(descLines.length, voLines.length) * 5 + 10;

    divider(doc, y);
    y += 8;

    // Animatic prompt
    label(doc, 'Animatic Prompt', MARGIN, y);
    y += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLORS.hint);
    const promptLines = doc.splitTextToSize(scene.visual_prompt || '—', CONTENT_W);
    doc.text(promptLines.slice(0, 4), MARGIN, y);
    y += Math.min(promptLines.length, 4) * 4.5 + 8;

    // Transition
    if (scene.transition_to_next) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      setColor(doc, COLORS.hint);
      doc.text(`→ Transition: ${scene.transition_to_next}`, PAGE_W - MARGIN, y, { align: 'right' });
    }

    // Page number footer
    doc.setFontSize(7);
    setColor(doc, COLORS.hint);
    doc.text(`Scene ${sceneNum} of ${scenes.length}`, PAGE_W / 2, PAGE_H - 10, { align: 'center' });
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    setColor(doc, [80, 76, 72]);
    doc.text('CampaignAI', MARGIN, PAGE_H - 8);
    doc.text(`${i} / ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 8, { align: 'right' });
  }

  const filename = `${(direction?.creative_title || 'storyboard').toLowerCase().replace(/\s+/g, '-')}-storyboard.pdf`;
  doc.save(filename);
}