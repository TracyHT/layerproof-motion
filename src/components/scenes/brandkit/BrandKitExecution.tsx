// src/components/scenes/brandkit/BrandKitExecution.tsx
// Scene 4 — Prompt → Choose Theme → Generate → Editor with brand-kit posts (~14.5s)

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { easeIO3 } from '../../../lib/animations';
import { useTheme } from '../../../lib/theme';
import { useBrandKitStrings } from './BrandKitLangContext';
import { useVideoScale } from '../../../lib/scale';
import { ANTON_FAMILY } from '../../../lib/loadFont';
import { PromptInputBox } from '../../ui/PromptInputBox';
import { Cursor } from '../../ui/Cursor';
import type { CursorKeyframe } from '../../../types';

// ── Timing ───────────────────────────────────────────────────────────────────

const TYPE_START    = 20;
const TYPE_END      = 100;
const GRID_IN       = 80;
const THEME_HOVER   = 140;
const THEME_CLICK   = 162;
const GEN_HOVER     = 195;
const GEN_CLICK     = 212;
const EDITOR_IN     = 216;   // transition immediately after Generate click
const ZOOM_START    = 276;   // slow zoom into preview image (after posts load)
const EXIT_START    = 370;
const EXIT_END      = 390;

// ── Camera ────────────────────────────────────────────────────────────────────
// Scale and origin both animate:
//   1.28 → 1.65 on theme click (zoom into card), back to 1.28 as cursor moves to Generate
// Origin X: 50% → 30% (card is left-center) → 62% (Generate is right-center)
// Origin Y: 48% → 74% (theme grid) → 48% (Generate / prompt area)

// PROMPT_TEXT is now read from strings context inside the component

// ── Theme card data ───────────────────────────────────────────────────────────

// LayerProof brand kit — only 1 theme (the one created/imported)
const LP_THEME = {
  name: 'LayerProof Brand Theme',
  description: 'Bold · Vibrant · Dark Mode',
  bg: '#111111',
  lines: [
    { color: '#FF589B', w: '55%', h: 8 },
    { color: '#888',    w: '75%', h: 6 },
    { color: '#FFD600', w: '40%', h: 6 },
    { color: '#555',    w: '65%', h: 5 },
    { color: '#FF589B', w: '30%', h: 14, radius: 7 },
  ],
};

// Theme Library — 4 generic themes
const LIBRARY_THEMES = [
  { name: 'Minimal Dark',   bg: '#1c1c1c', accent: '#FFD600', lines: [['#FFD600','45%',8],['#888','70%',6],['#666','55%',5],['#FFD600','28%',14]] },
  { name: 'Bold Gradient',  bg: '#1e1040', accent: '#f59e42', lines: [['#f59e42','50%',8],['#e8b87a','72%',6],['#d97706','58%',5],['#f59e42','32%',14]] },
  { name: 'Clean Light',    bg: '#f7f7f7', accent: '#3b82f6', lines: [['#3b82f6','48%',8],['#aaa','68%',6],['#ccc','54%',5],['#3b82f6','30%',14]] },
  { name: 'Neon Accent',    bg: '#0d0d14', accent: '#a855f7', lines: [['#a855f7','52%',8],['#0ea5e9','70%',6],['#10b981','56%',5],['#a855f7','30%',14]] },
];

// ── Cursor keyframes ─────────────────────────────────────────────────────────
// Cursor is INSIDE the camera rig → positions are canvas-space (0–1).
// Camera pans via transformOrigin so cursor naturally stays over each element.
//
// Prompt box top=260, height≈170, center y≈345 → y=0.32
// Generate button: right side of prompt, y≈345-62(shift)=283 → y≈0.28
//   Actually after shift prompt top=198, generate bottom≈198+155=353 → y≈0.31
// Dark Mode card: canvas y≈648 → y=0.60, x=left+half_card=(1920-1080)/2+40+120=980→x=0.26

const CURSOR_KFS: CursorKeyframe[] = [
  { frame: 10,  x: 0.28, y: 0.54 },   // left edge of textarea (typing start)
  { frame: 100, x: 0.52, y: 0.54 },   // typing done — hold until zoom starts
  { frame: 110, x: 0.52, y: 0.54 },   // brief pause before moving to card
  { frame: 132, x: 0.38, y: 0.80 },   // Dark Mode card center
  { frame: 162, x: 0.38, y: 0.80, click: true },
  { frame: 188, x: 0.68, y: 0.59 },   // Generate button (prompt shifted -62px)
  { frame: 212, x: 0.68, y: 0.59, click: true },
  { frame: 245, x: 0.55, y: 0.55 },
];

// TikTok cursor — positions are fractions of the 1080×1920 canvas (NOT 1920×1080).
// Content block (700px wide) is centred: left=190, right=890.
// Prompt textarea centre y ≈ 1096px → 0.571; LP card centre (360, 1189) → (0.333, 0.619)
// Generate button at ~830px from left, shifted-up prompt y ≈ 936px → (0.769, 0.488)
const CURSOR_KFS_TIKTOK: CursorKeyframe[] = [
  { frame: 10,  x: 0.21, y: 0.57 },   // left edge of textarea
  { frame: 100, x: 0.62, y: 0.57 },   // typing done
  { frame: 110, x: 0.62, y: 0.57 },
  { frame: 132, x: 0.33, y: 0.62 },   // LP theme card
  { frame: 162, x: 0.33, y: 0.62, click: true },
  { frame: 188, x: 0.77, y: 0.49 },   // Generate button (prompt shifted up 160px)
  { frame: 212, x: 0.77, y: 0.49, click: true },
  { frame: 245, x: 0.55, y: 0.55 },
];

// ── Editor posts ──────────────────────────────────────────────────────────────

const POSTS = [
  { bg: '#080808', accent: '#FF589B', image: staticFile('social-posts/post_1.png') },
  { bg: '#111111', accent: '#FFD600', image: staticFile('social-posts/post_2.png') },
  { bg: '#0d0d0d', accent: '#FF589B', image: staticFile('social-posts/post_3.png') },
];

// WIN dimensions computed inside component using useVideoScale()

// ─────────────────────────────────────────────────────────────────────────────

function ThemeCard({
  bg, lines, name, description, selected, hovered, enterFrame, frame, fps, image, cardWidth = 240,
}: {
  bg: string;
  lines: { color: string; w: string; h: number; radius?: number }[];
  name: string;
  description?: string;
  selected: boolean;
  hovered: boolean;
  enterFrame: number;
  frame: number;
  fps: number;
  image?: string;
  cardWidth?: number;
}) {
  const PINK = '#FF589B';
  const op = interpolate(frame, [enterFrame, enterFrame + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const s  = spring({ frame: Math.max(0, frame - enterFrame), fps, config: { stiffness: 100, damping: 22 } });
  const ty = interpolate(s, [0, 1], [18, 0]);
  const cardH = Math.round(cardWidth * 0.5);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 12,
      opacity: op, transform: `translateY(${ty}px)`,
    }}>
      <div style={{
        width: cardWidth, height: cardH,
        borderRadius: 14,
        background: bg,
        overflow: 'hidden',
        border: selected
          ? `2.5px solid ${PINK}`
          : hovered
            ? `2px solid ${PINK}66`
            : '1px solid rgba(255,255,255,0.10)',
        boxShadow: selected
          ? `0 0 28px ${PINK}44, 0 8px 32px rgba(0,0,0,0.5)`
          : hovered
            ? `0 0 16px ${PINK}22`
            : '0 4px 24px rgba(0,0,0,0.35)',
        position: 'relative', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Hero image area */}
        <div style={{
          flex: 1,
          background: `linear-gradient(135deg, ${PINK}22 0%, rgba(255,214,0,0.12) 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {image ? (
            <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            /* Neutral skeleton layout */
            <div style={{
              width: '100%', height: '100%',
              padding: '12px 14px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(255,255,255,0.12)' }} />
                <div style={{ width: '68%', height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.18)' }} />
                <div style={{ width: '45%', height: 5, borderRadius: 4, background: 'rgba(255,255,255,0.10)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ width: '80%', height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.10)' }} />
                <div style={{ width: '55%', height: 4, borderRadius: 3, background: 'rgba(255,255,255,0.07)' }} />
              </div>
            </div>
          )}
        </div>
        {/* Caption strip — only shown when no thumbnail image */}
        {!image && (
          <div style={{
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.35)',
            display: 'flex', flexDirection: 'column', gap: 5,
          }}>
            <div style={{ width: '70%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.55)' }} />
            <div style={{ width: '45%', height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.25)' }} />
          </div>
        )}
        {selected && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            width: 22, height: 22, borderRadius: '50%',
            background: PINK, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 800,
          }}>✓</div>
        )}
      </div>
      <div>
        <div style={{
          fontFamily: 'Inter, sans-serif', fontSize: Math.round(cardWidth * 0.062),
          fontWeight: selected ? 700 : 500,
          color: selected ? PINK : 'rgba(255,255,255,0.85)',
          letterSpacing: -0.2,
        }}>{name}</div>
        {description && (
          <div style={{
            fontFamily: 'Inter, sans-serif', fontSize: Math.round(cardWidth * 0.047),
            fontWeight: 400,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: 0,
            marginTop: 3,
          }}>{description}</div>
        )}
      </div>
    </div>
  );
}

function PostThumb({ post, enterFrame, frame, isFirst }: {
  post: typeof POSTS[0]; enterFrame: number; frame: number; isFirst: boolean;
}) {
  const [imgFailed, setImgFailed] = React.useState(false);
  const op = interpolate(frame, [enterFrame, enterFrame + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const s  = spring({ frame: Math.max(0, frame - enterFrame), fps: 30, config: { stiffness: 100, damping: 22 } });
  const sc = interpolate(s, [0, 1], [0.85, 1]);
  return (
    <div style={{
      width: 110, height: 110, borderRadius: 10,
      background: post.bg, flexShrink: 0, overflow: 'hidden',
      border: isFirst ? `2px solid ${post.accent}` : '1px solid rgba(255,255,255,0.10)',
      opacity: op, transform: `scale(${sc})`, position: 'relative',
    }}>
      {!imgFailed ? (
        <img
          src={post.image}
          onError={() => setImgFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 5, height: '100%' }}>
          <div style={{ width: '80%', height: 8, borderRadius: 3, background: 'rgba(255,255,255,0.35)' }} />
          <div style={{ width: '60%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.18)' }} />
          <div style={{ flex: 1, borderRadius: 5, background: `${post.accent}22`, marginTop: 2 }} />
          <div style={{ width: 54, height: 16, borderRadius: 8, background: post.accent, opacity: 0.9, alignSelf: 'center', marginTop: 'auto' }} />
        </div>
      )}
    </div>
  );
}

function PreviewPost({ previewIn, PINK, theme, imageSrc, size }: {
  previewIn: number;
  PINK: string;
  theme: ReturnType<typeof useTheme>;
  imageSrc: string;
  size: number;
}) {
  const [imgFailed, setImgFailed] = React.useState(false);
  return (
    <div style={{
      width: size, height: size, borderRadius: 20,
      background: '#080808',
      opacity: previewIn,
      transform: `scale(${interpolate(previewIn, [0, 1], [0.92, 1])})`,
      overflow: 'hidden',
      boxShadow: '0 32px 80px rgba(0,0,0,0.65)',
      border: `1px solid ${PINK}33`,
    }}>
      {!imgFailed ? (
        <img
          src={imageSrc}
          onError={() => setImgFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          padding: 54, height: '100%', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 22,
        }}>
          <div style={{
            fontFamily: theme.font.family, fontSize: 34,
            fontWeight: theme.font.weightBold, color: '#fff',
            textAlign: 'center', lineHeight: 1.2,
          }}>Safeguarding Your Innovation{'\n'}on Apple Platforms</div>
          <div style={{ fontFamily: theme.font.family, fontSize: 16, color: '#888', textAlign: 'center', lineHeight: 1.5 }}>
            Mastering IP Strategy{'\n'}for Developers and Designers
          </div>
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: `${PINK}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
          }}>🔒</div>
          <div style={{
            padding: '16px 36px', borderRadius: 50, background: PINK,
            fontFamily: theme.font.family, fontSize: 16, fontWeight: theme.font.weightBold, color: '#fff',
          }}>Explore IP Best Practices</div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export const BrandKitExecution: React.FC<{ tiktok?: boolean }> = ({ tiktok = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const s = useBrandKitStrings();
  const { w, h, scale, py } = useVideoScale();
  const PROMPT_TEXT = s.execPromptText;

  const PINK   = theme.colors.accentPink   ?? '#FF589B';
  const YELLOW = theme.colors.accentYellow ?? '#FFD600';

  const WIN_W = tiktok ? w - 40 * scale : 1540 * scale;
  // Preserve landscape 1540:860 (≈16:9) aspect ratio for TikTok editor
  const WIN_H = tiktok ? Math.round(WIN_W * (860 / 1540)) : 860 * scale;
  const WIN_X = (w - WIN_W) / 2;
  const WIN_Y = (h - WIN_H) / 2;

  const fadeIn  = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [EXIT_START, EXIT_END], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sceneOp = fadeIn * fadeOut;

  // ── Camera: dynamic scale + X/Y origin ───────────────────────────────────
  // ── Camera math ───────────────────────────────────────────────────────────
  // To keep canvas point (PX,PY) at screen center (960,540) when scaled by S:
  //   OX_px = (960 - S*PX) / (1-S),  OY_px = (540 - S*PY) / (1-S)
  // Card center: grid left=510+(240/2)=630px, grid top=720+header(52)+label(36)+halfCard(90)=898px
  // At zoom S=2.6 → OX=22.1%, OY=103.9%
  // Generate button center (after prompt shift -62px): x=0.69*1920=1324px, y=0.64*1080=691px
  // At zoom S=1.28 → OX=136.9%, OY=113.6% (we just return to natural pan instead)
  const ZOOM_S      = tiktok ? 1.8 : 2.6;
  // For tiktok: LP card left-aligned in 700*scale grid centered on screen
  // grid left = (w - 700*scale) / 2 = (1080 - 700) / 2 = 190; card center x = 190 + 150 = 340
  // CARD_PY tiktok: py(720) (grid top) + 52 (header row) + 18 (section margin) + (150/2 + 36)(half card+label) = +175
  const CARD_PX     = tiktok ? (w - 700 * scale) / 2 + 170 * scale : 630 * scale;
  const CARD_PY     = tiktok ? py(580) + 175 : py(898);
  const CARD_CTR_OX = ((w/2 - ZOOM_S * CARD_PX) / (1 - ZOOM_S)) / w * 100;
  const CARD_CTR_OY = ((h/2 - ZOOM_S * CARD_PY) / (1 - ZOOM_S)) / h * 100;

  // Cursor starts moving to card after typing finishes (TYPE_END=100), small pause
  const CURSOR_TO_CARD = 110;

  const CAM_CFG      = { stiffness: 72, damping: 22 };
  const CAM_CFG_SLOW = { stiffness: 28, damping: 22 };

  // All three camera values spring from a single start frame (CURSOR_TO_CARD=72)
  // so there are no phase-boundary jumps anywhere in the sequence.
  const camSpring = spring({ frame: Math.max(0, frame - CURSOR_TO_CARD), fps, config: CAM_CFG_SLOW });

  // After THEME_CLICK the cursor moves toward Generate — camera follows immediately
  const toGenSpring = spring({ frame: Math.max(0, frame - THEME_CLICK), fps, config: CAM_CFG });

  const BASE_SCALE  = tiktok ? 1.0 : 1.28;
  // TikTok: zoom in 1.25× while typing, spring back to 1.0 when grid reveals
  const TYPE_SCALE  = tiktok ? 1.25 : BASE_SCALE;
  const gridRevealSpring = spring({ frame: Math.max(0, frame - GRID_IN), fps, config: { stiffness: 50, damping: 22 } });

  const camScale = (() => {
    if (tiktok) {
      if (frame < GRID_IN)          return TYPE_SCALE;
      if (frame < CURSOR_TO_CARD)   return interpolate(gridRevealSpring, [0, 1], [TYPE_SCALE, 1.0]);
      if (frame <= THEME_CLICK)     return interpolate(camSpring, [0, 1], [1.0, ZOOM_S]);
      return interpolate(toGenSpring, [0, 1], [ZOOM_S, 1.0]);
    }
    if (frame < CURSOR_TO_CARD) return BASE_SCALE;
    if (frame <= THEME_CLICK) return interpolate(camSpring, [0, 1], [BASE_SCALE, ZOOM_S]);
    return interpolate(toGenSpring, [0, 1], [ZOOM_S, BASE_SCALE]);
  })();

  const camOriginX = (() => {
    if (tiktok) {
      if (frame < CURSOR_TO_CARD)   return 50;
      if (frame <= THEME_CLICK)     return interpolate(camSpring, [0, 1], [50, CARD_CTR_OX]);
      return interpolate(toGenSpring, [0, 1], [CARD_CTR_OX, 68]);
    }
    if (frame < CURSOR_TO_CARD) return 50;
    if (frame <= THEME_CLICK) return interpolate(camSpring, [0, 1], [50, CARD_CTR_OX]);
    return interpolate(toGenSpring, [0, 1], [CARD_CTR_OX, 68]);
  })();

  const camOriginY = (() => {
    if (tiktok) {
      // Focus on prompt area (slightly above vertical center) while typing, then pan to center
      if (frame < GRID_IN)          return 38;
      if (frame < CURSOR_TO_CARD)   return interpolate(gridRevealSpring, [0, 1], [38, 48]);
      if (frame <= THEME_CLICK)     return interpolate(camSpring, [0, 1], [48, CARD_CTR_OY]);
      return interpolate(toGenSpring, [0, 1], [CARD_CTR_OY, 59]);
    }
    if (frame < CURSOR_TO_CARD) return 48;
    if (frame <= THEME_CLICK) return interpolate(camSpring, [0, 1], [48, CARD_CTR_OY]);
    return interpolate(toGenSpring, [0, 1], [CARD_CTR_OY, 59]);
  })();

  // ── Prompt typing ─────────────────────────────────────────────────────────

  const promptChars = Math.round(interpolate(
    Math.max(0, frame - TYPE_START),
    [0, TYPE_END - TYPE_START],
    [0, PROMPT_TEXT.length],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  ));

  // Prompt + grid phase fades out as editor comes in
  const promptPhaseOp = interpolate(frame, [EDITOR_IN - 15, EDITOR_IN + 15], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Prompt box shifts up as grid appears — more aggressively on TikTok
  const gridProgress = interpolate(frame, [GRID_IN, GRID_IN + 30], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const promptShiftY = interpolate(easeIO3(gridProgress), [0, 1], [0, tiktok ? -160 * scale : -62 * scale]);

  // ── Theme grid ────────────────────────────────────────────────────────────

  const gridSpring = spring({ frame: Math.max(0, frame - GRID_IN), fps, config: { stiffness: 70, damping: 22 } });
  const gridOp = interpolate(frame, [GRID_IN, GRID_IN + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const gridY  = interpolate(gridSpring, [0, 1], [48, 0]);

  const darkModeHovered  = frame >= THEME_HOVER && frame < THEME_CLICK;
  const darkModeSelected = frame >= THEME_CLICK;

  // Library card stagger
  const LIBRARY_ENTER = [GRID_IN + 10, GRID_IN + 22, GRID_IN + 34, GRID_IN + 46];

  // ── Generate button glow ──────────────────────────────────────────────────

  const genHovered = frame >= GEN_HOVER;

  // ── Editor window ─────────────────────────────────────────────────────────

  const editorSpring = spring({ frame: Math.max(0, frame - EDITOR_IN), fps, config: { stiffness: 65, damping: 22 } });
  const editorOp = interpolate(frame, [EDITOR_IN, EDITOR_IN + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const editorY  = interpolate(editorSpring, [0, 1], [52, 0]);

  // Slow push-in zoom + pan to center the preview image (at ~68% from left)
  const editorZoomSpring = spring({ frame: Math.max(0, frame - ZOOM_START), fps, config: { stiffness: 22, damping: 26 } });
  const editorZoom = interpolate(editorZoomSpring, [0, 1], [1.0, 1.55]);
  // Pan left so the preview image (pinned at 68%) reaches screen centre (50%)
  const editorPanX = interpolate(editorZoomSpring, [0, 1], [0, -WIN_W * 0.18]);

  const POST_ENTER = [EDITOR_IN + 28, EDITOR_IN + 48, EDITOR_IN + 68];
  const previewIn  = interpolate(frame, [EDITOR_IN + 26, EDITOR_IN + 58], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: theme.colors.bgDark, opacity: sceneOp, overflow: 'hidden' }}>

      {/* ── Camera rig (zoom + pan, prompt/grid phases only) ── */}
      {frame < EDITOR_IN + 16 && (
      <div style={{
        position: 'absolute', top: 0, left: 0, width: w, height: h,
        transform: `scale(${camScale})`,
        transformOrigin: `${camOriginX}% ${camOriginY}%`,
      }}>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '25%', width: '50%', height: '60%',
        background: `radial-gradient(ellipse, ${PINK}09 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* ── Prompt + Theme Grid phase ── */}
      {frame < EDITOR_IN + 16 && (
        <div style={{ position: 'absolute', inset: 0, opacity: promptPhaseOp }}>

          {/* Heading + Prompt box — vertically centered */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: interpolate(frame, [0, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}>
            <div style={{
              width: tiktok ? 700 * scale : 900 * scale,
              transform: `translateY(${promptShiftY}px)`,
            }}>
              {/* Social Post pill */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 999,
                border: `1px solid ${YELLOW}55`,
                background: `${YELLOW}0f`,
                marginBottom: 28,
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="12" height="9" rx="1.5" stroke={YELLOW} strokeWidth="1.2" />
                  <line x1="1" y1="4" x2="13" y2="4" stroke={YELLOW} strokeWidth="1" />
                  <line x1="4" y1="13" x2="10" y2="13" stroke={YELLOW} strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="7" y1="10" x2="7" y2="13" stroke={YELLOW} strokeWidth="1.1" />
                </svg>
                <span style={{
                  fontFamily: theme.font.family,
                  fontSize: 15,
                  fontWeight: theme.font.weightMedium,
                  color: YELLOW,
                  letterSpacing: 0.2,
                }}>{s.execPillLabel}</span>
              </div>

              {/* Main headline */}
              <div style={{
                fontSize: tiktok ? 40 * scale : 50,
                fontWeight: 400,
                fontFamily: ANTON_FAMILY,
                lineHeight: 1.15,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 20,
              }}>
                <span style={{ color: '#FFFFFF' }}>{s.execHeadlinePrefix}</span>
                <span style={{ color: PINK }}>{s.execHeadlineAccent}</span>
                <span style={{ color: '#FFFFFF' }}>{s.execHeadlineSuffix}</span>
              </div>

              {/* Subtitle */}
              <div style={{
                fontFamily: theme.font.family,
                fontSize: tiktok ? 18 * scale : 22,
                fontWeight: 300,
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.55,
                letterSpacing: 0.1,
                marginBottom: 36,
              }}>
                {s.execSubtitle}
              </div>

              {/* Prompt box */}
              <PromptInputBox
                promptText={PROMPT_TEXT}
                promptChars={promptChars}
                frame={frame}
                showCursor={frame >= TYPE_START}
                generateHighlighted={genHovered}
                cardOnly
              />
            </div>
          </div>

          {/* Theme grid */}
          {frame >= GRID_IN && (
            <div style={{
              position: 'absolute',
              top: tiktok ? py(580) : py(720),
              left: '50%',
              transform: `translateX(-50%) translateY(${gridY}px)`,
              width: tiktok ? 700 * scale : 900 * scale,
              opacity: gridOp,
            }}>
              {/* Grid header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 24,
              }}>
                <div style={{
                  fontFamily: theme.font.family, fontSize: 22,
                  fontWeight: theme.font.weightBold, color: '#fff',
                }}>{s.execChooseTheme}</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 18px', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.05)',
                  fontFamily: theme.font.family, fontSize: 14, color: '#aaa',
                }}>
                  <span style={{ fontSize: 16 }}>⊞</span>
                  <span>{s.execViewMore}</span>
                </div>
              </div>

              {/* Brand Kit · LayerProof section */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ marginBottom: 18 }} />

                {/* Single LayerProof theme card */}
                <ThemeCard
                  bg={LP_THEME.bg}
                  lines={LP_THEME.lines}
                  name={LP_THEME.name}
                  description={LP_THEME.description}
                  selected={darkModeSelected}
                  hovered={darkModeHovered}
                  enterFrame={GRID_IN}
                  frame={frame}
                  fps={fps}
                  image={staticFile('brand-kit-thumbnail.png')}
                  cardWidth={tiktok ? 340 : 240}
                />
              </div>

              {/* Theme Library section */}
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18,
                }}>
                  <span style={{ fontSize: 14, color: '#777' }}>⊞</span>
                  <span style={{
                    fontFamily: theme.font.family, fontSize: 15,
                    fontWeight: theme.font.weightMedium, color: '#777',
                  }}>{s.execThemeLibrary}</span>
                </div>

                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {LIBRARY_THEMES.slice(0, tiktok ? 2 : 4).map((t, i) => {
                    const ls = t.lines.map(([color, w, h]) => ({ color: color as string, w: w as string, h: h as number }));
                    return (
                      <ThemeCard
                        key={t.name}
                        bg={t.bg}
                        lines={ls}
                        name={t.name}
                        selected={false}
                        hovered={false}
                        enterFrame={LIBRARY_ENTER[i]}
                        frame={frame}
                        fps={fps}
                        cardWidth={tiktok ? 340 : 240}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Cursor lives inside the rig so it moves with the zoom/pan */}
      <Cursor keyframes={tiktok ? CURSOR_KFS_TIKTOK : CURSOR_KFS} containerWidth={w} containerHeight={h} size={tiktok ? 2.0 : 2.8} />

      </div>
      )}

      {/* ── Editor window (no camera transform — fills its own space) ── */}
      {frame >= EDITOR_IN && (
        <div style={{
          position: 'absolute',
          top: WIN_Y, left: WIN_X,
          width: WIN_W, height: WIN_H,
          borderRadius: 16, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)',
          opacity: editorOp,
          transform: `translateY(${editorY}px) translateX(${editorPanX}px) scale(${editorZoom})`,
          transformOrigin: '68% 50%',
          background: '#0d0d0d',
        }}>
        {/* Inner wrapper: render at landscape pixel size, scale down for TikTok */}
        <div style={{
          width: tiktok ? 1540 : WIN_W,
          height: tiktok ? 860 : WIN_H,
          transform: tiktok ? `scale(${WIN_W / 1540})` : undefined,
          transformOrigin: '0 0',
          display: 'flex', flexDirection: 'column',
          flexShrink: 0,
        }}>

          {/* Title bar */}
          <div style={{
            height: 52, background: '#1a1a1a',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center',
            paddingLeft: 20, paddingRight: 20, gap: 14, flexShrink: 0,
          }}>
            {/* Back arrow */}
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 11L5 7L9 3" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{
              fontFamily: theme.font.family, fontSize: 14,
              fontWeight: theme.font.weightMedium, color: 'rgba(255,255,255,0.85)',
            }}>{s.execEditorTitle}</div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
              {/* Outline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <rect x="1.5" y="1.5" width="10" height="10" rx="1.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
                  <line x1="4" y1="4.5" x2="9" y2="4.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeLinecap="round" />
                  <line x1="4" y1="6.5" x2="9" y2="6.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeLinecap="round" />
                  <line x1="4" y1="8.5" x2="7" y2="8.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeLinecap="round" />
                </svg>
                <span style={{ fontFamily: theme.font.family, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Outline</span>
              </div>
              {/* Look & Feel */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
                  <circle cx="6.5" cy="6.5" r="2" stroke="rgba(255,255,255,0.45)" strokeWidth="1.1" />
                </svg>
                <span style={{ fontFamily: theme.font.family, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Look &amp; Feel</span>
              </div>
              {/* Rate */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 1.5L7.8 4.8H11.3L8.5 6.8L9.5 10.2L6.5 8.2L3.5 10.2L4.5 6.8L1.7 4.8H5.2L6.5 1.5Z" stroke="rgba(255,255,255,0.45)" strokeWidth="1.1" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: theme.font.family, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Rate</span>
              </div>
              {/* Share */}
              <div style={{
                padding: '6px 20px', borderRadius: 7, background: YELLOW,
                fontFamily: theme.font.family, fontSize: 13,
                fontWeight: theme.font.weightBold, color: '#000',
              }}>Share</div>
              {/* Plan badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 7,
                border: '1px solid rgba(255,255,255,0.10)',
                fontFamily: theme.font.family, fontSize: 12, color: '#888',
              }}>Plan: <span style={{ color: '#fff', marginLeft: 4 }}>Unlimited</span></div>
              {/* Avatar */}
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: YELLOW,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: theme.font.family, fontSize: 13, fontWeight: 700, color: '#000',
              }}>T</div>
            </div>
          </div>

          {/* Content row */}
          <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

            {/* Left panel — Brief + Agent */}
            <div style={{
              width: 390 * scale, background: '#161616',
              borderRight: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', flexDirection: 'column', flexShrink: 0,
            }}>

              {/* Brief section */}
              <div style={{
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                padding: '16px 20px',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
                      <line x1="4" y1="5" x2="10" y2="5" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" />
                      <line x1="4" y1="7.2" x2="10" y2="7.2" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" />
                      <line x1="4" y1="9.4" x2="7.5" y2="9.4" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontFamily: theme.font.family, fontSize: 14, fontWeight: theme.font.weightBold, color: '#fff' }}>Brief</span>
                  </div>
                  {/* Collapse chevron */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M5 10L8 7L11 10" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ fontFamily: theme.font.family, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 14 }}>
                  {s.execBriefText}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {/* Copy icon */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 7,
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.1" />
                      <path d="M3 9H2C1.45 9 1 8.55 1 8V2C1 1.45 1.45 1 2 1H8C8.55 1 9 1.45 9 2V3" stroke="rgba(255,255,255,0.35)" strokeWidth="1.1" />
                    </svg>
                  </div>
                  {/* Iterate button */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 7,
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: 'rgba(255,255,255,0.04)',
                    fontFamily: theme.font.family, fontSize: 12, color: 'rgba(255,255,255,0.65)',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M10 6A4 4 0 1 1 6 2" stroke="rgba(255,255,255,0.55)" strokeWidth="1.3" strokeLinecap="round" />
                      <path d="M6 1L8 3L6 5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Iterate
                  </div>
                </div>
              </div>

              {/* Agent section */}
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}>
                {/* Agent header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px 10px', flexShrink: 0,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 15, color: PINK }}>◈</div>
                    <span style={{ fontFamily: theme.font.family, fontSize: 14, fontWeight: theme.font.weightBold, color: '#fff' }}>Agent</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {/* Clear */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 6,
                      border: '1px solid rgba(255,255,255,0.09)',
                      background: 'rgba(255,255,255,0.04)',
                      fontFamily: theme.font.family, fontSize: 11, color: '#666',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2L8 8M8 2L2 8" stroke="#666" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                      Clear
                    </div>
                    {/* Copy */}
                    <div style={{
                      width: 28, height: 28, borderRadius: 6,
                      border: '1px solid rgba(255,255,255,0.09)',
                      background: 'rgba(255,255,255,0.04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" stroke="#666" strokeWidth="1.1" />
                        <path d="M2.5 8H2A1 1 0 0 1 1 7V2A1 1 0 0 1 2 1H7A1 1 0 0 1 8 2V2.5" stroke="#555" strokeWidth="1.1" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Agent message */}
                <div style={{ flex: 1, padding: '0 20px', overflowY: 'auto' }}>
                  <div style={{ fontFamily: theme.font.family, fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: 16 }}>
                    {s.execAgentIntro}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 16, fontFamily: theme.font.family, fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.85, listStyle: 'disc' }}>
                    <li>{s.execAgentBullet1}</li>
                    <li>{s.execAgentBullet2}</li>
                    <li>{s.execAgentBullet3}</li>
                  </ul>
                  {/* Thumbs */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    {[
                      <path key="up" d="M2 9V5.5L5 2H6L6.5 4.5H10L9.5 8H6V9H2Z" stroke="rgba(255,255,255,0.3)" strokeWidth="1.1" strokeLinejoin="round" fill="none" />,
                      <path key="down" d="M2 5V8.5L5 12H6L6.5 9.5H10L9.5 6H6V5H2Z" stroke="rgba(255,255,255,0.3)" strokeWidth="1.1" strokeLinejoin="round" fill="none" />,
                    ].map((icon, i) => (
                      <div key={i} style={{
                        width: 28, height: 28, borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.03)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">{icon}</svg>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat input — pinned to bottom */}
                <div style={{
                  padding: '12px 16px', flexShrink: 0,
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}>
                  {/* Page tabs */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 6,
                      background: `${PINK}22`, border: `1px solid ${PINK}44`,
                      fontFamily: theme.font.family, fontSize: 11,
                      fontWeight: theme.font.weightMedium, color: PINK,
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: PINK }} />
                      Page 1
                    </div>
                    <div style={{
                      padding: '4px 10px', borderRadius: 6,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      fontFamily: theme.font.family, fontSize: 11, color: '#555',
                    }}>Instagram · 1:1</div>
                  </div>
                  {/* Input row */}
                  <div style={{
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: 'rgba(255,255,255,0.04)',
                    padding: '10px 10px 10px 14px',
                  }}>
                    <div style={{
                      fontFamily: theme.font.family, fontSize: 12,
                      color: 'rgba(255,255,255,0.22)', marginBottom: 10,
                    }}>Edit Page 1…</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* + add */}
                      <div style={{
                        width: 26, height: 26, borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M5 2V8M2 5H8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      </div>
                      {/* Model selector */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '4px 10px', borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.10)',
                        background: 'rgba(255,255,255,0.04)',
                        fontFamily: theme.font.family, fontSize: 11, color: '#777',
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: PINK, opacity: 0.8 }} />
                        Sonnet 4.6
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ marginLeft: 2 }}>
                          <path d="M2 3L4 5L6 3" stroke="#666" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      {/* Send button */}
                      <div style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: 7, background: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M1 11L11 1M11 1H4M11 1V8" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail strip */}
            <div style={{
              width: 160 * scale, background: '#121212',
              borderRight: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              paddingTop: 14, gap: 12, flexShrink: 0, overflowY: 'auto',
            }}>
              {POSTS.map((post, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <PostThumb post={post} enterFrame={POST_ENTER[i]} frame={frame} isFirst={i === 0} />
                  <div style={{ fontFamily: theme.font.family, fontSize: 10, color: '#444' }}>{i + 1}</div>
                </div>
              ))}
              {/* Add page button */}
              <div style={{
                width: 110, height: 62, borderRadius: 8,
                border: '1.5px dashed rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 2,
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3V13M3 8H13" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Preview pane */}
            <div style={{
              flex: 1, background: '#111',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Preview toolbar */}
              <div style={{
                height: 44, borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center',
                paddingLeft: 20, paddingRight: 16, gap: 10, flexShrink: 0,
              }}>
                {/* Platform pill */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 7,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.05)',
                  fontFamily: theme.font.family, fontSize: 12, fontWeight: theme.font.weightMedium, color: '#ddd',
                }}>
                  Instagram
                  <span style={{ color: '#555', fontWeight: 400 }}>1:1</span>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ marginLeft: 2 }}>
                    <path d="M2 3L4 5L6 3" stroke="#666" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {/* Version History */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', fontFamily: theme.font.family, fontSize: 12, color: '#555' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="#555" strokeWidth="1.1" />
                    <path d="M6 3.5V6L7.5 7.5" stroke="#555" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Version History
                </div>
                {/* Mark to edit */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', fontFamily: theme.font.family, fontSize: 12, color: '#555' }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <circle cx="5.5" cy="5.5" r="4" stroke="#555" strokeWidth="1.1" />
                    <circle cx="5.5" cy="5.5" r="1.5" fill="#555" />
                  </svg>
                  Mark to edit
                </div>
                {/* Action icons */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  {[
                    <path key="undo" d="M3 5H7.5A2.5 2.5 0 1 1 7.5 10H5" stroke="#555" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
                    <path key="redo" d="M9 5H4.5A2.5 2.5 0 1 0 4.5 10H7" stroke="#555" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
                    <path key="dl" d="M6 2V8M3.5 6L6 8.5L8.5 6M3 10H9" stroke="#555" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
                    <rect key="copy" x="3" y="3" width="6" height="6" rx="1" stroke="#555" strokeWidth="1.1" fill="none" />,
                  ].map((icon, i) => (
                    <div key={i} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">{icon}</svg>
                    </div>
                  ))}
                </div>
              </div>

              {/* Canvas area */}
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#0e0e0e', position: 'relative',
              }}>
                <PreviewPost
                  previewIn={previewIn}
                  PINK={PINK}
                  theme={theme}
                  imageSrc={staticFile('social-posts/preview_1.png')}
                  size={540 * scale}
                />
                {/* Zoom indicator */}
                <div style={{
                  position: 'absolute', bottom: 16, left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <div style={{ width: 90, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ width: '55%', height: '100%', borderRadius: 2, background: 'rgba(255,255,255,0.25)' }} />
                  </div>
                  <div style={{ fontFamily: theme.font.family, fontSize: 11, color: '#555' }}>110%</div>
                </div>
              </div>

              {/* Preview bottom bar */}
              <div style={{
                height: 40, borderTop: '1px solid rgba(255,255,255,0.07)', background: '#151515',
                display: 'flex', alignItems: 'center', paddingLeft: 16, paddingRight: 16,
                justifyContent: 'space-between', flexShrink: 0,
              }}>
                <div style={{ fontFamily: theme.font.family, fontSize: 11, color: '#444' }}>Get started</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: theme.font.family, fontSize: 11, color: '#444' }}>1 / 5</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0,1,2,3,4].map((i) => (
                      <div key={i} style={{ width: i === 0 ? 16 : 6, height: 4, borderRadius: 2, background: i === 0 ? YELLOW : 'rgba(255,255,255,0.12)' }} />
                    ))}
                  </div>
                  <span style={{ fontFamily: theme.font.family, fontSize: 11, color: '#444' }}>1 / 3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

    </AbsoluteFill>
  );
};
