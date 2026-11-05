// src/components/scenes/brandkit/BrandKitSecret.tsx
// Scene 2 — Brand Kit Import (local frames 0–300, 10s)
// Act 1: URL paste + Import click → Act 2: camera punch-in → Act 3: loading checklist
// Act 4: items expand with brand info, camera scrolls top→bottom following cursor

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { easeIO3, easeOut3 } from '../../../lib/animations';
import { ANTON_FAMILY, ROBOTO_FAMILY } from '../../../lib/loadFont';
import { useTheme } from '../../../lib/theme';
import { useVideoScale } from '../../../lib/scale';
import { useBrandKitStrings } from './BrandKitLangContext';
import { Cursor } from '../../ui/Cursor';
import type { CursorKeyframe } from '../../../types';

// ── Timing ───────────────────────────────────────────────────────────────────

const TITLE_IN_START  = 5;
const TITLE_IN_END    = 22;
const TITLE_OUT_START = 68;
const TITLE_OUT_END   = 86;

// Subtitle text phase (shifted +30f total — 1s pause after "The secret?" fades)
const TEXT_IN_START   = 82;
const TEXT_IN_END     = 98;
const TEXT_OUT_START  = 218; // 4s hold after subtitle fully appears (TEXT_IN_END=98 + 120f)
const TEXT_OUT_END    = 232;

const PANEL_IN        = 232;  // follows text phase out
const URL_PASTE_FRAME = 258;
const CLICK_FRAME     = 294;

const PANEL_OUT_START = 299;
const PANEL_OUT_END   = 320;

const LOADING_IN      = 320;
// Ticks spaced 20f apart
const TICK_1          = 334;
const TICK_2          = 354;
const TICK_3          = 374;
const TICK_4          = 409; // +15f — 0.5s extra delay before Brand Voice
const TICK_5          = 429;
const TICK_6          = 485; // +56f — brief beat before brand theme

const LOADING_OUT_START = TICK_6; // kept for camera logic reference

// Base geometry at 1920×1080 — scaled inside component
const EXP_CARD_H_BASE  = 158;
const EXP_CARD_HS_BASE          = [158, 158, 158, 148, 158, 230];
// Portrait: typography card (index 2) stacks two font cards vertically — needs more height
const EXP_CARD_HS_BASE_PORTRAIT = [158, 158, 250, 240, 158, 230];
const EXP_GAP_BASE     = 12;
const COMPACT_H_BASE   = 48;
const ITEM_COUNT       = 6;
const CARD_STACK_W     = 600; // base width of each checklist card

// Zoom fires immediately when Brand Theme step ticks
const ZOOM_START  = TICK_6;          // punch-in starts at the tick itself
const EXIT_START  = ZOOM_START + 90; // hold to let content reveal + linger
const EXIT_END    = EXIT_START + 24;

// ── Content ──────────────────────────────────────────────────────────────────

const SAMPLE_URL   = 'layerproof.app';
const BRAND_COLORS = ['#FF589B', '#FFD600', '#080808', '#FFFFFF', '#6B7280'];


// ── Cursor keyframes ─────────────────────────────────────────────────────────

// Landscape: calibrated from camera math (see original comments)
const CURSOR_KFS_LANDSCAPE: CursorKeyframe[] = [
  { frame: 240, x: 0.34,  y: 0.57 },
  { frame: 258, x: 0.30,  y: 0.57, click: true },
  { frame: 286, x: 0.455, y: 0.57, click: true },
  { frame: 304, x: 0.5,   y: 0.5  },
  { frame: TICK_1 + 6,  x: 0.58, y: 0.5  },
  { frame: TICK_2 + 6,  x: 0.58, y: 0.5  },
  { frame: TICK_3 + 6,  x: 0.58, y: 0.5  },
  { frame: TICK_4 + 6,  x: 0.58, y: 0.5  },
  { frame: TICK_5 + 6,  x: 0.58, y: 0.5  },
  { frame: ZOOM_START,  x: 0.5,  y: 0.5  },
  { frame: ZOOM_START + 18, x: 0.38, y: 0.54 },
  { frame: EXIT_START - 8,  x: 0.36, y: 0.53 },
];

// Portrait: panel is centered, URL input sits at ~y=0.62, Import button at ~x=0.72
const CURSOR_KFS_PORTRAIT: CursorKeyframe[] = [
  { frame: 240, x: 0.35,  y: 0.60 },             // hover near URL field
  { frame: 258, x: 0.30,  y: 0.60, click: true }, // click URL field to paste
  { frame: 286, x: 0.72,  y: 0.60, click: true }, // click Import button (right side)
  { frame: 304, x: 0.5,   y: 0.5  },
  { frame: TICK_1 + 6,  x: 0.58, y: 0.5  },
  { frame: TICK_2 + 6,  x: 0.58, y: 0.5  },
  { frame: TICK_3 + 6,  x: 0.58, y: 0.5  },
  { frame: TICK_4 + 6,  x: 0.58, y: 0.5  },
  { frame: TICK_5 + 6,  x: 0.58, y: 0.5  },
  { frame: ZOOM_START,  x: 0.5,  y: 0.5  },
  { frame: ZOOM_START + 18, x: 0.45, y: 0.54 },
  { frame: EXIT_START - 8,  x: 0.43, y: 0.53 },
];

// TikTok: same as portrait for pre-zoom phases; camX only shifts at ZOOM_START
const CURSOR_KFS_TIKTOK: CursorKeyframe[] = [
  { frame: 240, x: 0.35,  y: 0.60 },
  { frame: 258, x: 0.30,  y: 0.60, click: true },
  { frame: 286, x: 0.72,  y: 0.60, click: true },
  { frame: 304, x: 0.5,   y: 0.5  },
  { frame: TICK_1 + 6,  x: 0.58, y: 0.5  },
  { frame: TICK_2 + 6,  x: 0.58, y: 0.5  },
  { frame: TICK_3 + 6,  x: 0.58, y: 0.5  },
  { frame: TICK_4 + 6,  x: 0.58, y: 0.5  },
  { frame: TICK_5 + 6,  x: 0.58, y: 0.5  },
  // camX springs to 0.454 at ZOOM_START — shift cursor right accordingly
  { frame: ZOOM_START,        x: 0.54, y: 0.5  },
  { frame: ZOOM_START + 18,   x: 0.52, y: 0.54 },
  { frame: EXIT_START - 8,    x: 0.50, y: 0.53 },
];

// ─────────────────────────────────────────────────────────────────────────────

export const BrandKitSecret: React.FC<{ tiktok?: boolean }> = ({ tiktok = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, scale, isPortrait } = useVideoScale();
  const theme = useTheme();
  const s = useBrandKitStrings();

  // Scale geometry to canvas size
  const EXP_CARD_H  = EXP_CARD_H_BASE * scale;
  const EXP_CARD_HS = (tiktok ? EXP_CARD_HS_BASE_PORTRAIT : EXP_CARD_HS_BASE).map(v => v * scale);
  const EXP_GAP     = (tiktok ? 8 : EXP_GAP_BASE) * scale;
  const COMPACT_H   = COMPACT_H_BASE * scale;
  const stackW      = CARD_STACK_W * scale;

  const _EXP_STACK_H = EXP_CARD_HS.reduce((a, v) => a + v, 0) + (ITEM_COUNT - 1) * EXP_GAP;
  const _STACK_TOP_Y = (h - _EXP_STACK_H) / 2;
  const ITEM_TOPS = (() => {
    let y = _STACK_TOP_Y;
    return EXP_CARD_HS.map((ch) => { const top = y; y += ch + EXP_GAP; return top; });
  })();
  const REVIEW_CAM_YS = (() => {
    let topY = _STACK_TOP_Y;
    return EXP_CARD_HS.map((ch) => {
      const cy = (topY + ch / 2) / h;
      topY += ch + EXP_GAP;
      return cy;
    });
  })();
  const REVIEW_CAM_Y6 = REVIEW_CAM_YS[ITEM_COUNT - 1];

  const CHECKLIST = [
    { label: s.secretCheck1, sectionName: s.secretSection1, tickFrame: TICK_1 },
    { label: s.secretCheck2, sectionName: s.secretSection2, tickFrame: TICK_2 },
    { label: s.secretCheck3, sectionName: s.secretSection3, tickFrame: TICK_3 },
    { label: s.secretCheck4, sectionName: s.secretSection4, tickFrame: TICK_4 },
    { label: s.secretCheck5, sectionName: s.secretSection5, tickFrame: TICK_5 },
    { label: s.secretCheck6, sectionName: s.secretSection6, tickFrame: TICK_6 },
  ];

  const COLOR_LABELS = [s.secretColorLabel_pink, s.secretColorLabel_yellow, s.secretColorLabel_dark, s.secretColorLabel_white, s.secretColorLabel_neutral];

  const PINK   = theme.colors.accentPink   ?? '#FF589B';
  const YELLOW = theme.colors.accentYellow ?? '#FFD600';

  const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

  // ── Camera ────────────────────────────────────────────────────────────────
  const CAM_CURSOR_START = 240;
  const CAM_INPUT_CLICK  = 258;

  const cameraScale = (() => {
    if (frame <= CAM_CURSOR_START) return 1.0;
    if (frame <= CAM_INPUT_CLICK) {
      const t = easeOut3((frame - CAM_CURSOR_START) / (CAM_INPUT_CLICK - CAM_CURSOR_START));
      return 1.0 + 0.06 * t;
    }
    if (frame <= CLICK_FRAME) {
      const t = easeOut3((frame - CAM_INPUT_CLICK) / (CLICK_FRAME - CAM_INPUT_CLICK));
      return 1.06 + 0.12 * t;
    }
    if (frame <= CLICK_FRAME + 20) {
      const t = easeOut3((frame - CLICK_FRAME) / 20);
      return 1.18 + 0.62 * t; // → 1.80
    }
    // Breathe back to focus zoom as items start loading
    if (frame <= TICK_1) {
      const t = easeOut3((frame - (CLICK_FRAME + 20)) / (TICK_1 - CLICK_FRAME - 20));
      return 1.80 + 0.10 * t; // → 1.9
    }
    // Hold focus zoom throughout item review — no pre-zoom
    if (frame <= ZOOM_START) return 1.9;
    // Punch-in only at Brand Theme tick
    if (frame <= EXIT_START) {
      const s = spring({ frame: frame - ZOOM_START, fps, config: { stiffness: 55, damping: 20 } });
      return 1.9 + 1.3 * s; // → 3.2
    }
    return 3.2;
  })();

  const camY = (() => {
    if (frame <= CAM_CURSOR_START) return 0.5;
    if (frame <= CLICK_FRAME) {
      const t = easeOut3((frame - CAM_CURSOR_START) / (CLICK_FRAME - CAM_CURSOR_START));
      return 0.5 + 0.019 * t;
    }
    if (frame <= CLICK_FRAME + 20) return 0.519;
    // Drift back to center before first item
    if (frame <= TICK_1) {
      const t = easeOut3((frame - (CLICK_FRAME + 20)) / (TICK_1 - CLICK_FRAME - 20));
      return 0.519 - 0.019 * t; // → 0.5
    }
    // Smooth continuous pan from first item through last — camera leads slightly
    // so items fly UP into an already-centered frame
    if (frame <= ZOOM_START) {
      const PAN_START = TICK_3;
      const t = easeIO3(Math.max(0, (frame - PAN_START) / (ZOOM_START - PAN_START)));
      return REVIEW_CAM_YS[0] + (REVIEW_CAM_YS[4] - REVIEW_CAM_YS[0]) * t;
    }
    // At ZOOM_START spring to Brand Theme
    if (frame <= EXIT_START) {
      const s = spring({ frame: frame - ZOOM_START, fps, config: { stiffness: 50, damping: 22 } });
      return REVIEW_CAM_YS[4] + (REVIEW_CAM_Y6 - REVIEW_CAM_YS[4]) * Math.min(s, 1);
    }
    return REVIEW_CAM_Y6;
  })();

  // For tiktok: shift camX only during the brand theme zoom so the card is centered
  const camX = (() => {
    if (!tiktok) return 0.5;
    if (frame < ZOOM_START) return 0.5;
    const t = Math.min(spring({ frame: frame - ZOOM_START, fps, config: { stiffness: 50, damping: 22 } }), 1);
    return 0.5 + (490 / w - 0.5) * t;
  })();

  const cameraTX = (w / 2 - camX * w) * cameraScale;
  const cameraTY = (h / 2 - camY * h) * cameraScale;

  // ── Scene opacity ─────────────────────────────────────────────────────────
  const fadeInOp = interpolate(frame, [0, 15], [0, 1], clamp);
  const exitOp   = interpolate(frame, [EXIT_START, EXIT_END], [1, 0], clamp);
  const sceneOpacity = fadeInOp * exitOp;

  // ── Title ─────────────────────────────────────────────────────────────────
  const titleOpacity =
    interpolate(frame, [TITLE_IN_START, TITLE_IN_END], [0, 1], clamp) *
    interpolate(frame, [TITLE_OUT_START, TITLE_OUT_END], [1, 0], clamp);

  // ── Import panel ──────────────────────────────────────────────────────────
  const panelSpring = spring({ frame: Math.max(0, frame - PANEL_IN), fps, config: { stiffness: 80, damping: 22 } });
  const panelY      = interpolate(panelSpring, [0, 1], [32 * scale, 0]);
  const panelInOp   = interpolate(Math.max(0, frame - PANEL_IN), [0, 20], [0, 1], clamp);
  const panelOutOp  = interpolate(frame, [PANEL_OUT_START, PANEL_OUT_END], [1, 0], clamp);
  const panelOp     = panelInOp * panelOutOp;
  const panelExitY  = interpolate(frame, [PANEL_OUT_START, PANEL_OUT_END], [0, -380 * scale], clamp);

  const cardSpringScale = interpolate(
    spring({ frame: Math.max(0, frame - PANEL_IN), fps, config: { stiffness: 70, damping: 22 } }),
    [0, 1], [0.88, 1.0]
  );
  void cardSpringScale;

  const displayUrl = frame >= URL_PASTE_FRAME ? SAMPLE_URL : '';
  const isPasted   = frame >= URL_PASTE_FRAME;

  // ── Loading state ─────────────────────────────────────────────────────────
  const loadingItemSprings = CHECKLIST.map((item, i) => {
    const delay = (i === 0 || i === ITEM_COUNT - 1) ? item.tickFrame : item.tickFrame - 8;
    const sp = spring({ frame: Math.max(0, frame - delay), fps, config: { stiffness: 60, damping: 20 } });
    return {
      y:          interpolate(sp, [0, 1], [200 * scale, 0]),
      entranceOp: interpolate(Math.max(0, frame - delay), [0, 10], [0, 1], clamp),
    };
  });

  // Per-item expand spring — triggers immediately when item ticks (slow, deliberate)
  const expandSprings = CHECKLIST.map((item) =>
    spring({ frame: Math.max(0, frame - item.tickFrame), fps, config: { stiffness: 38, damping: 22 } })
  );

  // Checklist tick state
  const tickedItems  = CHECKLIST.map((item) => frame >= item.tickFrame);
  const activeIndex  = tickedItems.findIndex(t => !t);
  const tickSprings  = CHECKLIST.map((item) =>
    spring({ frame: Math.max(0, frame - item.tickFrame), fps, config: { stiffness: 120, damping: 16 } })
  );

  // ── Expanded card content ─────────────────────────────────────────────────
  // All content is sized to fit within a 76px content area (card 148px - 2×18px padding - 12px gap - ~24px label)
  const renderExpandedContent = (i: number) => {
    // i=0: Logo — 3 variants: symbol / logo (horizontal) / wordmark
    if (i === 0) {
      const TILE = 96 * scale;
      const tileStyle: React.CSSProperties = {
        width: TILE, height: TILE, borderRadius: 14 * scale,
        background: '#111', border: '1px solid rgba(255,255,255,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      };
      return (
        <div style={{ display: 'flex', gap: 14 * scale, alignItems: 'flex-start' }}>
          <div style={tileStyle}>
            <img src={staticFile('layerproof-symbol.png')} style={{ width: 46 * scale, height: 46 * scale, objectFit: 'contain' }} />
          </div>
          <div style={tileStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: `0 ${10 * scale}px` }}>
              <img src={staticFile('layerproof-symbol.png')} style={{ width: 22 * scale, height: 22 * scale, objectFit: 'contain', flexShrink: 0 }} />
              <span style={{ fontFamily: theme.font.family, fontSize: 13 * scale, fontWeight: theme.font.weightBold, color: theme.colors.white, letterSpacing: -0.3, lineHeight: 1, whiteSpace: 'nowrap' as const }}>LayerProof</span>
            </div>
          </div>
          <div style={tileStyle}>
            <span style={{ fontFamily: theme.font.family, fontSize: 13 * scale, fontWeight: theme.font.weightBold, color: theme.colors.white, letterSpacing: -0.3, lineHeight: 1, whiteSpace: 'nowrap' as const, padding: `0 ${10 * scale}px` }}>LayerProof</span>
          </div>
        </div>
      );
    }
    // i=1: Colours
    if (i === 1) return (
      <div style={{ display: 'flex', gap: 12 * scale, alignItems: 'flex-start' }}>
        {BRAND_COLORS.map((c, ci) => (
          <div key={ci} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 * scale }}>
            <div style={{ width: 52 * scale, height: 52 * scale, borderRadius: 10 * scale, background: c, border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: theme.font.family, fontSize: 11 * scale, fontWeight: theme.font.weightMedium, color: theme.colors.white }}>{COLOR_LABELS[ci]}</div>
              <div style={{ fontFamily: theme.font.family, fontSize: 10 * scale, color: theme.colors.gray, marginTop: 1, letterSpacing: 0.3 }}>{c}</div>
            </div>
          </div>
        ))}
      </div>
    );
    // i=2: Typography
    if (i === 2) return (
      <div style={{ display: 'flex', flexDirection: tiktok ? 'column' : 'row', gap: 12 * scale }}>
        {[
          { role: s.secretTypoRole_heading, family: ANTON_FAMILY,  name: 'Anton',  weight: 700, weights: s.secretTypoWeights_heading },
          { role: s.secretTypoRole_body,    family: ROBOTO_FAMILY, name: 'Roboto', weight: 400, weights: s.secretTypoWeights_body },
        ].map((f) => (
          <div key={f.role} style={{
            display: 'flex', alignItems: 'center', gap: 16 * scale,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 12 * scale, padding: `${10 * scale}px ${18 * scale}px`,
            ...(tiktok ? { width: 280 * scale, boxSizing: 'border-box' as const } : { flex: 1 }),
          }}>
            <span style={{ fontFamily: f.family, fontSize: 64 * scale, fontWeight: f.weight, color: theme.colors.white, letterSpacing: f.role === s.secretTypoRole_heading ? 2 : -1, lineHeight: 1, flexShrink: 0 }}>Aa</span>
            <div>
              <div style={{ fontFamily: theme.font.family, fontSize: 10 * scale, color: theme.colors.gray, letterSpacing: 0.8, textTransform: 'uppercase' as const, marginBottom: 2 }}>{f.role}</div>
              <div style={{ fontFamily: theme.font.family, fontSize: 14 * scale, fontWeight: theme.font.weightBold, color: theme.colors.white }}>{f.name}</div>
              <div style={{ fontFamily: theme.font.family, fontSize: 10 * scale, color: theme.colors.gray, marginTop: 1 }}>{f.weights}</div>
            </div>
          </div>
        ))}
      </div>
    );
    // i=3: Brand Voice
    if (i === 3) return (
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 12 * scale, alignItems: 'stretch' }}>
        {[
          { label: s.secretVoice_toneLabel,     body: s.secretVoice_toneBody,     italic: true },
          { label: s.secretVoice_audienceLabel, body: s.secretVoice_audienceBody, italic: false },
        ].map((box) => (
          <div key={box.label} style={{
            ...(tiktok ? { width: 280 * scale, boxSizing: 'border-box' as const } : { flex: 1 }),
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 10 * scale, padding: `${8 * scale}px ${12 * scale}px`,
          }}>
            <div style={{ fontFamily: theme.font.family, fontSize: 10 * scale, color: theme.colors.gray, letterSpacing: 0.8, textTransform: 'uppercase' as const, marginBottom: 6 }}>{box.label}</div>
            <div style={{ fontFamily: theme.font.family, fontSize: 13 * scale, color: theme.colors.white, fontStyle: box.italic ? 'italic' : 'normal', lineHeight: 1.4 }}>{box.body}</div>
          </div>
        ))}
        <div style={{
          ...(tiktok ? { width: 280 * scale, boxSizing: 'border-box' as const } : { flex: 1 }),
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 10 * scale, padding: `${8 * scale}px ${12 * scale}px`,
        }}>
          <div style={{ fontFamily: theme.font.family, fontSize: 10 * scale, color: theme.colors.gray, letterSpacing: 0.8, textTransform: 'uppercase' as const, marginBottom: 6 }}>{s.secretVoice_personalityLabel}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5 }}>
            {[s.secretVoice_trait1, s.secretVoice_trait2, s.secretVoice_trait3].map((p) => (
              <span key={p} style={{
                fontFamily: theme.font.family, fontSize: 11 * scale, color: YELLOW,
                background: `${YELLOW}18`, border: `1px solid ${YELLOW}44`,
                borderRadius: 5, padding: `${2 * scale}px ${8 * scale}px`,
              }}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    );
    // i=4: Image Assets
    if (i === 4) return (
      <div style={{ display: 'flex', gap: 10 * scale, alignItems: 'center' }}>
        {(tiktok ? ['lightbeam.png', 'laptop.png', 'badges/character.png'] : ['lightbeam.png', 'brain.png', 'laptop.png', 'badges/character.png']).map((src, idx) => (
          <div key={idx} style={{ width: 90 * scale, height: 90 * scale, borderRadius: 8 * scale, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
            <img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ))}
        <div style={{
          width: 90 * scale, height: 90 * scale, borderRadius: 8 * scale, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}>
          <span style={{ fontFamily: theme.font.family, fontSize: 18 * scale, fontWeight: theme.font.weightBold, color: theme.colors.white }}>+4</span>
        </div>
      </div>
    );
    // i=5: Brand Theme (camera zooms in here)
    const loadingOp = interpolate(frame, [ZOOM_START, ZOOM_START + 10, ZOOM_START + 40, ZOOM_START + 50], [0, 1, 1, 0], clamp);
    const spinDeg = (frame * 6) % 360;
    const svgSize = 40 * scale;
    const R = 16 * scale;
    const CIRC = 2 * Math.PI * R;
    const dashLen = CIRC * 0.7;
    return (
      <div style={{ position: 'relative' }}>
        {loadingOp > 0 && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: loadingOp,
          }}>
            <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ display: 'block' }}>
              <circle cx={svgSize/2} cy={svgSize/2} r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={2.5} />
              <circle
                cx={svgSize/2} cy={svgSize/2} r={R}
                fill="none" stroke={YELLOW} strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray={`${dashLen} ${CIRC}`}
                strokeDashoffset={0}
                transform={`rotate(${spinDeg} ${svgSize/2} ${svgSize/2})`}
              />
            </svg>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 * scale }}>
          <div style={{ width: 180 * scale, height: 90 * scale, borderRadius: 10 * scale, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
            <img src={staticFile('brand-kit-thumbnail.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div>
            <div style={{ fontFamily: theme.font.family, fontSize: 16 * scale, fontWeight: theme.font.weightMedium, color: theme.colors.white, letterSpacing: -0.2 }}>{s.secretThemeName}</div>
            <div style={{ fontFamily: theme.font.family, fontSize: 11 * scale, color: theme.colors.gray, marginTop: 3 }}>{s.secretThemeDesc}</div>
          </div>
        </div>
      </div>
    );
  };


  return (
    <AbsoluteFill style={{ background: isPortrait ? '#161616' : theme.colors.bgDark, opacity: sceneOpacity, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: w,
        height: h,
        transform: `translate(${cameraTX}px, ${cameraTY}px) scale(${cameraScale})`,
        transformOrigin: 'center center',
      }}>

        {/* ── "The secret?" ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: titleOpacity,
          pointerEvents: 'none',
        }}>
          <span style={{
            fontFamily: theme.font.family,
            fontSize: 100 * scale,
            fontWeight: 600,
            color: theme.colors.white,
            letterSpacing: -2.5,
          }}>
            {s.secretTitle}
          </span>
        </div>

        {/* ── Subtitle text phase ── */}
        {(() => {
          const op =
            interpolate(frame, [TEXT_IN_START, TEXT_IN_END], [0, 1], clamp) *
            interpolate(frame, [TEXT_OUT_START, TEXT_OUT_END], [1, 0], clamp);
          const slideY = interpolate(
            spring({ frame: Math.max(0, frame - TEXT_IN_START), fps, config: { stiffness: 70, damping: 22 } }),
            [0, 1], [28, 0]
          );
          return (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 24,
              opacity: op, transform: `translateY(${slideY}px)`,
              pointerEvents: 'none',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 * scale, textAlign: 'center' }}>
                <img
                  src={staticFile('brand-kit-banner.png')}
                  style={{
                    height: isPortrait ? 380 * scale : 520 * scale,
                    width: 'auto',
                    maxWidth: isPortrait ? w * 0.72 : w - 80 * scale,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
                <span style={{
                  fontFamily: theme.font.family, fontSize: (isPortrait ? 130 : 110) * scale,
                  fontWeight: 600, color: theme.colors.white,
                  letterSpacing: -3, lineHeight: 1.1, textTransform: 'none',
                }}><span style={{ color: theme.colors.accentPink }}>{s.secretSubtitleBrand}</span> in LayerProof</span>
                <span style={{
                  fontFamily: theme.font.family, fontSize: (isPortrait ? 52 : 44) * scale,
                  fontWeight: theme.font.weightLight, color: theme.colors.gray,
                  letterSpacing: -0.5,
                }}>{s.secretSubtitleTagline}</span>
              </div>
            </div>
          );
        })()}

        {/* ── ACT 1: Import panel ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 36,
          opacity: panelOp,
          transform: `translateY(${panelY + panelExitY}px)`,
          pointerEvents: 'none',
        }}>
<div style={{
            display: 'flex',
            flexDirection: isPortrait ? 'column' : 'row',
            borderRadius: isPortrait ? 0 : 24,
            overflow: 'hidden',
            border: isPortrait ? 'none' : `1px solid ${theme.colors.glassBorder}`,
            background: isPortrait ? 'transparent' : theme.colors.glassBg,
            backdropFilter: isPortrait ? 'none' : 'blur(20px)',
            width: isPortrait ? 'fit-content' : undefined,
            maxWidth: isPortrait ? w - 80 * scale : undefined,
          }}>
            {/* FORM */}
            {(() => {
              const fs = scale * (isPortrait ? 1.6 : 1); // form scale boost for portrait
              return (
                <div style={{
                  flexShrink: 0,
                  width: isPortrait ? 'auto' : 'fit-content',
                  padding: isPortrait ? `${36 * fs}px ${40 * fs}px` : `${56 * scale}px ${52 * scale}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isPortrait ? 'center' : 'flex-start',
                  gap: 28 * fs,
                  boxSizing: 'border-box' as const,
                }}>
                  {isPortrait && (
                    <img
                      src={staticFile('brand-kit-card.png')}
                      style={{ width: 200 * fs, height: 'auto', objectFit: 'contain', display: 'block', borderRadius: 12 }}
                    />
                  )}
                  <div style={{
                    fontFamily: theme.font.family,
                    fontSize: 40 * fs,
                    fontWeight: theme.font.weightMedium,
                    color: theme.colors.white,
                    letterSpacing: -1,
                    lineHeight: 1.15,
                    textAlign: isPortrait ? 'center' : 'left',
                  }}>
                    {s.secretPanelHeadline}<br />
                    <span style={{ color: YELLOW }}>{s.secretPanelSubheadline}</span>
                  </div>
                  <div style={{
                    fontFamily: theme.font.family,
                    fontSize: 22 * fs,
                    fontWeight: theme.font.weightLight,
                    color: theme.colors.gray,
                    lineHeight: 1.5,
                  }}>
                    {s.secretPanelDesc}
                  </div>

                  {/* URL input row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    gap: 16 * fs,
                    background: 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${isPasted ? `${YELLOW}88` : theme.colors.glassBorder}`,
                    borderRadius: 14 * fs,
                    padding: `${13 * fs}px ${18 * fs}px`,
                  }}>
                    <svg width={22 * fs} height={22 * fs} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke={theme.colors.gray} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke={theme.colors.gray} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{
                      fontFamily: theme.font.family,
                      fontSize: 22 * fs,
                      color: displayUrl ? theme.colors.white : theme.colors.gray,
                      flex: 1,
                      letterSpacing: 0.2,
                    }}>
                      {displayUrl || s.secretUrlPlaceholder}
                    </span>
                    <div style={{
                      padding: `${10 * fs}px ${24 * fs}px`,
                      borderRadius: 10 * fs,
                      background: isPasted ? YELLOW : 'rgba(255,255,255,0.08)',
                      color: isPasted ? '#000000' : theme.colors.gray,
                      fontFamily: theme.font.family,
                      fontSize: 20 * fs,
                      fontWeight: theme.font.weightBold,
                      flexShrink: 0,
                    }}>
                      {s.secretImportBtn}
                    </div>
                  </div>

                  {/* PDF upload button */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    alignSelf: isPortrait ? 'center' : 'flex-start',
                    gap: 14 * fs,
                    border: `2px solid rgba(255,255,255,0.45)`,
                    borderRadius: 18 * fs,
                    padding: `${22 * fs}px ${36 * fs}px`,
                    color: theme.colors.white,
                    fontFamily: theme.font.family,
                    fontSize: 22 * fs,
                    fontWeight: theme.font.weightMedium,
                    background: 'transparent',
                  }}>
                    <span style={{ fontSize: 22 * fs }}>↑</span>
                    {s.secretUploadBtn}
                  </div>
                </div>
              );
            })()}

            {/* RIGHT — brand kit preview image (landscape only; portrait shows it above the form) */}
            {!isPortrait && (
              <div style={{
                width: 580 * scale,
                flexShrink: 0,
                background: '#1e1e1e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 36 * scale,
              }}>
                <img
                  src={staticFile('brand-kit-card.png')}
                  style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block', borderRadius: 16 }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── ACT 3 + 4: Items load as checklist rows, expand inline on tick ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}>
          {CHECKLIST.map((item, i) => {
            const exp = expandSprings[i];
            const cardH = interpolate(exp, [0, 1], [COMPACT_H, EXP_CARD_HS[i]]);
            // Brand Theme: 1.5s loading state before content reveals
            const expandedOp = i === ITEM_COUNT - 1
              ? interpolate(frame, [ZOOM_START + 45, ZOOM_START + 65], [0, 1], clamp)
              : interpolate(exp, [0.2, 1], [0, 1], clamp);
            const isTicked  = tickedItems[i];
            const isActive  = activeIndex === i;
            const isPending = !isTicked && !isActive;
            const tickScale = interpolate(tickSprings[i], [0, 1], [0.6, 1.0]);
            const { y: itemY, entranceOp } = loadingItemSprings[i];

            // Line height: from bottom of circle to top of next circle
            // circle center Y = COMPACT_H/2 = 24, radius = 9 → bottom at 33
            // next circle top = cardH + EXP_GAP + (COMPACT_H/2 - 9) = cardH + EXP_GAP + 15
            // line height = cardH + EXP_GAP - 18
            const lineH = cardH + EXP_GAP - 18;
            const lineOp = interpolate(entranceOp, [0.5, 1], [0, 1], clamp);

            return (
              <div key={i} style={{
                position: 'absolute',
                top: ITEM_TOPS[i],
                left: tiktok ? w / 2 - (52 + 140) * scale - 50 * scale : (w - stackW) / 2,
                width: stackW,
                height: cardH,
                opacity: entranceOp,
                transform: `translateY(${itemY}px)`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'visible',
                borderRadius: 18,
                boxSizing: 'border-box' as const,
              }}>
                {/* Vertical connector — only when both this item is ticked AND next item is visible */}
                {i < ITEM_COUNT - 2 && isTicked && loadingItemSprings[i + 1].entranceOp > 0 && (
                  <div style={{
                    position: 'absolute',
                    left: (24 + 8) * scale,
                    top: COMPACT_H / 2 + 9 * scale,
                    width: 1.5,
                    height: lineH,
                    background: `rgba(255,214,0,${0.25 * lineOp})`,
                    borderRadius: 1,
                  }} />
                )}

                {/* Header row — always visible once item enters */}
                <div style={{
                  height: COMPACT_H,
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 10 * scale,
                  padding: `0 ${24 * scale}px`,
                }}>
                  <div style={{
                    width: 18 * scale, height: 18 * scale, borderRadius: 9 * scale, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: `scale(${isTicked ? tickScale : 1})`,
                    background: isTicked ? YELLOW : 'transparent',
                    border: isTicked ? 'none' : `1.5px solid ${isPending ? `${YELLOW}33` : YELLOW}`,
                  }}>
                    {isTicked && <span style={{ color: '#000', fontSize: 10 * scale, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                  </div>
                  <span style={{
                    fontFamily: theme.font.family, fontSize: 18 * scale,
                    fontWeight: theme.font.weightMedium,
                    color: isPending ? theme.colors.gray : theme.colors.white,
                    letterSpacing: -0.3,
                  }}>{item.label}</span>
                </div>

                {/* Brand content — revealed below header as card grows */}
                <div style={{
                  flex: 1,
                  opacity: expandedOp,
                  padding: `${4 * scale}px ${24 * scale}px ${10 * scale}px ${52 * scale}px`,
                  overflow: tiktok ? 'visible' : 'hidden',
                }}>
                  {renderExpandedContent(i)}
                </div>
              </div>
            );
          })}
        </div>


      </div>
      {/* Cursor — outside camera transform so it renders in screen space */}
      <Cursor keyframes={tiktok ? CURSOR_KFS_TIKTOK : isPortrait ? CURSOR_KFS_PORTRAIT : CURSOR_KFS_LANDSCAPE} />
    </AbsoluteFill>
  );
};
