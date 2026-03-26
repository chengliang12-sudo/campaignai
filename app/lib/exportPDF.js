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
  return 5;
}

function bodyText(doc, text, x, y, maxWidth, options = {}) {
  doc.setFontSize(options.size || 10);
  doc.setFont('helvetica', options.italic ? 'italic' : 'normal');
  setColor(doc, options.color || COLORS.dark);
  const lines = doc.splitTextToSize(String(text || '—'), maxWidth);
  doc.text(lines, x, y);
  return lines.length * (options.lineHeight || 5.2);
}

function heading(doc, text, x, y, size = 18) {
  doc.setFontSize(size);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.black);
  doc.text(String(text || ''), x, y);
}

function divider(doc, y) {
  setColor(doc, COLORS.border, 'draw');
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
}

function pageHeader(doc, text) {
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.hint);
  doc.text(text.toUpperCase(), MARGIN, MARGIN + 4);
  return MARGIN + 14;
}

function checkPageBreak(doc, y, neededHeight = 20) {
  if (y + neededHeight > PAGE_H - 20) {
    doc.addPage();
    return MARGIN + 10;
  }
  return y;
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

function footers(doc, totalPages) {
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    setColor(doc, COLORS.hint);
    doc.text('AIGCStudio by eFusion', MARGIN, PAGE_H - 8);
    doc.text(`${i} / ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 8, { align: 'right' });
  }
}

export async function exportStoryboardPDF({ analysis, direction, scenes, sceneImages, brief, brandProfile }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // ── PAGE 1 — COVER ───────────────────────────────────────────
  setColor(doc, COLORS.black, 'fill');
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  const logoW = 52;
  const logoH = 16;
  const logoX = (PAGE_W - logoW) / 2;
  const logoY = PAGE_H / 2 - 32;

  // Logo pill
  setColor(doc, [30, 30, 30], 'fill');
  doc.roundedRect(logoX - 10, logoY - 4, logoW + 20, logoH + 8, 4, 4, 'F');

  // AIGC in white, Studio in pink
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.white);
  doc.text('AIGC', PAGE_W / 2 - 10, logoY + 9, { align: 'right' });
  setColor(doc, [233, 30, 140]);
  doc.text('Studio', PAGE_W / 2 - 8, logoY + 9, { align: 'left' });

  // by eFusion Technology
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setColor(doc, [160, 155, 148]);
  doc.text('by eFusion Technology', PAGE_W / 2, logoY + 20, { align: 'center' });

  // Campaign Storyboard
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  setColor(doc, [140, 135, 128]);
  doc.text('Campaign Storyboard', PAGE_W / 2, logoY + 34, { align: 'center' });

  // Date
  doc.setFontSize(8);
  setColor(doc, [100, 96, 90]);
  doc.text(
    new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    PAGE_W / 2, logoY + 44, { align: 'center' }
  );

  // ── PAGE 2 — CAMPAIGN OVERVIEW ───────────────────────────────
  doc.addPage();
  let y = pageHeader(doc, 'Campaign Overview');

  heading(doc, direction?.creative_title || 'Untitled Campaign', MARGIN, y, 22);
  y += 12;
  divider(doc, y);
  y += 10;

  label(doc, 'Product', MARGIN, y);
  y += 5;
  y += bodyText(doc, analysis?.product_name, MARGIN, y, CONTENT_W) + 8;

  y = checkPageBreak(doc, y, 30);
  label(doc, 'Original Brief', MARGIN, y);
  y += 5;
  y += bodyText(doc, brief, MARGIN, y, CONTENT_W) + 8;

  y = checkPageBreak(doc, y, 20);
  divider(doc, y);
  y += 10;

  label(doc, 'Product Description', MARGIN, y);
  y += 5;
  y += bodyText(doc, analysis?.product_description, MARGIN, y, CONTENT_W) + 8;

  y = checkPageBreak(doc, y, 20);
  label(doc, 'Core Message', MARGIN, y);
  y += 5;
  y += bodyText(doc, analysis?.core_message, MARGIN, y, CONTENT_W) + 8;

  y = checkPageBreak(doc, y, 20);
  label(doc, 'Call to Action', MARGIN, y);
  y += 5;
  y += bodyText(doc, analysis?.cta, MARGIN, y, CONTENT_W) + 8;

  // Brand profile section
  if (brandProfile?.brandName || brandProfile?.brandVoice || brandProfile?.brandRules) {
    y = checkPageBreak(doc, y, 40);
    divider(doc, y);
    y += 10;

    label(doc, 'Brand Profile', MARGIN, y);
    y += 8;

    if (brandProfile.brandName) {
      label(doc, 'Brand Name', MARGIN, y);
      y += 5;
      y += bodyText(doc, brandProfile.brandName, MARGIN, y, CONTENT_W) + 8;
    }
    if (brandProfile.brandVoice) {
      y = checkPageBreak(doc, y, 20);
      label(doc, 'Brand Voice', MARGIN, y);
      y += 5;
      y += bodyText(doc, brandProfile.brandVoice, MARGIN, y, CONTENT_W) + 8;
    }
    if (brandProfile.brandRules) {
      y = checkPageBreak(doc, y, 20);
      label(doc, 'Brand Rules', MARGIN, y);
      y += 5;
      y += bodyText(doc, brandProfile.brandRules, MARGIN, y, CONTENT_W) + 8;
    }
    if (brandProfile.brandGuidelines) {
      y = checkPageBreak(doc, y, 20);
      label(doc, 'Brand Guidelines', MARGIN, y);
      y += 5;
      bodyText(doc, brandProfile.brandGuidelines, MARGIN, y, CONTENT_W, {
        size: 9, color: COLORS.muted,
      });
    }
  }

  // ── PAGE 3 — CREATIVE DIRECTION ──────────────────────────────
  doc.addPage();
  y = pageHeader(doc, 'Creative Direction');

  heading(doc, 'Creative Direction', MARGIN, y, 16);
  y += 10;
  divider(doc, y);
  y += 10;

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

  label(doc, 'What we understood from your brief', MARGIN, y);
  y += 8;

  let leftY = y;
  let rightY = y;

  fields.forEach(([lbl, val], i) => {
    const col = i % 2 === 0 ? leftX : rightX;
    const curY = i % 2 === 0 ? leftY : rightY;
    label(doc, lbl, col, curY);
    const lineH = bodyText(doc, val, col, curY + 5, colW);
    if (i % 2 === 0) leftY += lineH + 14;
    else rightY += lineH + 14;
  });

  y = Math.max(leftY, rightY) + 4;
  y = checkPageBreak(doc, y, 30);
  divider(doc, y);
  y += 10;

  label(doc, 'Narrative Arc', MARGIN, y);
  y += 5;
  y += bodyText(doc, direction?.narrative_arc, MARGIN, y, CONTENT_W) + 10;

  y = checkPageBreak(doc, y, 30);
  divider(doc, y);
  y += 10;

  label(doc, 'Master Style Seed', MARGIN, y);
  y += 5;
  bodyText(doc, direction?.master_style_seed, MARGIN, y, CONTENT_W, {
    size: 9, italic: true, color: COLORS.muted, lineHeight: 5,
  });

  // ── PAGE 4 — COLOR PALETTE & VISUAL IDENTITY ─────────────────
  doc.addPage();
  y = pageHeader(doc, 'Visual Identity');

  heading(doc, 'Color Palette & Emotion', MARGIN, y, 16);
  y += 10;
  divider(doc, y);
  y += 12;

  if (direction?.color_palette) {
    const paletteEntries = Object.entries(direction.color_palette).filter(([k]) => k !== 'mood');
    const swatchCount = paletteEntries.length;
    const swatchW = Math.min(50, (CONTENT_W - (swatchCount - 1) * 8) / swatchCount);
    const swatchH = 36;
    let swatchX = MARGIN;

    paletteEntries.forEach(([key, hex]) => {
      const rgb = hexToRgb(hex);
      setColor(doc, rgb, 'fill');
      setColor(doc, COLORS.border, 'draw');
      doc.setLineWidth(0.2);
      doc.roundedRect(swatchX, y, swatchW, swatchH, 3, 3, 'FD');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setColor(doc, COLORS.muted);
      doc.text(key.toUpperCase(), swatchX, y + swatchH + 6);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      setColor(doc, COLORS.dark);
      doc.text(hex, swatchX, y + swatchH + 12);

      swatchX += swatchW + 8;
    });

    y += swatchH + 20;
  }

  y = checkPageBreak(doc, y, 20);
  divider(doc, y);
  y += 10;

  if (direction?.color_palette?.mood) {
    label(doc, 'Palette Mood', MARGIN, y);
    y += 5;
    y += bodyText(doc, direction.color_palette.mood, MARGIN, y, CONTENT_W, { size: 11 }) + 14;
  }

  y = checkPageBreak(doc, y, 20);
  divider(doc, y);
  y += 10;

  label(doc, 'Emotion Journey', MARGIN, y);
  y += 5;
  y += bodyText(doc, direction?.overall_emotion_journey, MARGIN, y, CONTENT_W) + 10;

  y = checkPageBreak(doc, y, 20);
  divider(doc, y);
  y += 10;

  label(doc, 'Music Direction', MARGIN, y);
  y += 5;
  y += bodyText(doc, direction?.music_direction, MARGIN, y, CONTENT_W) + 10;

  y = checkPageBreak(doc, y, 20);
  divider(doc, y);
  y += 10;

  label(doc, 'Cinematography Style', MARGIN, y);
  y += 5;
  bodyText(doc, direction?.cinematography_style, MARGIN, y, CONTENT_W);

  // ── SCENE PAGES ───────────────────────────────────────────────
  for (const scene of scenes) {
    doc.addPage();
    y = MARGIN;

    const sceneNum = Number(scene.scene_number);
    const imageData = sceneImages?.[sceneNum]?.imageUrl
      ? await fetchImageAsBase64(sceneImages[sceneNum].imageUrl)
      : null;

    const imgH = Math.round((CONTENT_W * 9) / 16);

    if (imageData) {
      try {
        doc.addImage(imageData, 'JPEG', MARGIN, y, CONTENT_W, imgH, undefined, 'FAST');
      } catch {
        setColor(doc, COLORS.bg, 'fill');
        setColor(doc, COLORS.border, 'draw');
        doc.roundedRect(MARGIN, y, CONTENT_W, imgH, 3, 3, 'FD');
        doc.setFontSize(9);
        setColor(doc, COLORS.hint);
        doc.text('Keyframe unavailable', PAGE_W / 2, y + imgH / 2, { align: 'center' });
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

    // Scene header row
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    setColor(doc, COLORS.black);
    doc.text(`Scene ${sceneNum}`, MARGIN, y);

    const beatText = (scene.emotional_beat || '').toUpperCase();
    doc.setFontSize(7);
    const beatW = doc.getTextWidth(beatText) + 6;
    setColor(doc, [238, 244, 255], 'fill');
    doc.roundedRect(MARGIN + 30, y - 5, beatW, 6, 1.5, 1.5, 'F');
    setColor(doc, [74, 111, 165]);
    doc.text(beatText, MARGIN + 33, y - 0.8);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLORS.muted);
    doc.text(`${scene.duration_seconds}s`, PAGE_W - MARGIN, y, { align: 'right' });

    y += 8;
    divider(doc, y);
    y += 8;

    // Scene description
    label(doc, 'Scene Description', MARGIN, y);
    y += 5;
    y += bodyText(doc, scene.action_description, MARGIN, y, CONTENT_W) + 8;

    y = checkPageBreak(doc, y, 20);
    divider(doc, y);
    y += 8;

    // Voiceover
    label(doc, 'Voiceover Script', MARGIN, y);
    y += 5;
    y += bodyText(doc, `"${scene.voiceover_script}"`, MARGIN, y, CONTENT_W, {
      italic: true, color: [100, 96, 92],
    }) + 8;

    y = checkPageBreak(doc, y, 20);
    divider(doc, y);
    y += 8;

    // Animatic prompt
    label(doc, 'Animatic Prompt', MARGIN, y);
    y += 5;
    const promptLines = doc.splitTextToSize(scene.visual_prompt || '—', CONTENT_W);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLORS.hint);
    doc.text(promptLines.slice(0, 5), MARGIN, y);

    // Transition
    if (scene.transition_to_next) {
      doc.setFontSize(8);
      setColor(doc, COLORS.hint);
      doc.text(`→ Transition: ${scene.transition_to_next}`, PAGE_W - MARGIN, PAGE_H - 16, { align: 'right' });
    }
  }

  // Footers
  footers(doc, doc.getNumberOfPages());

  const filename = `${(direction?.creative_title || 'storyboard')
    .toLowerCase().replace(/\s+/g, '-')}-storyboard.pdf`;
  doc.save(filename);
}