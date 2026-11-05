// src/components/scenes/brandkit/BrandKitHook.tsx
// Scene 1 — Hook (local frames 0–280, ~9.3s)
// Phase 1: cards slide right→left fast with rising wave on Y
// Phase 2: hero text fades in + orbiting badge images

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { useTheme } from '../../../lib/theme';
import { useVideoScale } from '../../../lib/scale';
import { useBrandKitStrings } from './BrandKitLangContext';
import { Image, PenNib, Aperture, Person, Mountains, Cube, Palette, Shapes } from '@phosphor-icons/react';

// ── Base geometry (at 1920×1080) — scaled inside component ───────────────────
const CARD_W_BASE     = 680;
const CARD_GAP_BASE   = 80;
const CARDS_PER_ROW   = 22;
const WAVE_AMP_BASE   = 70;
const WAVE_LEN_BASE   = 3840;
const WAVE_SPEED      = 0.03;
const ROW_Y_RATIO     = 200 / 1080; // vertical position as fraction of canvas height

// Portrait: single centered row
const PORTRAIT_ROW_Y_RATIO = 0.50;

// ── Images ────────────────────────────────────────────────────────────────────

const WAVE_IMAGES = [
  'wave/img_1.png',
  'wave/img_2.png',
  'wave/img_3.png',
  'wave/img_4.png',
  'wave/img_5.png',
  'wave/img_6.png',
];

const FALLBACK_IMG = staticFile('brand-kit-card.png');

const PostImg: React.FC<{ filename: string; style: React.CSSProperties }> = ({ filename, style }) => {
  const [errored, setErrored] = React.useState(false);
  return (
    <img
      src={errored ? FALLBACK_IMG : staticFile(filename)}
      onError={() => setErrored(true)}
      style={style}
    />
  );
};

// ── Phase 1: sliding wave ─────────────────────────────────────────────────────

// Dynamic velocity: smooth start, decelerates to a gentle crawl (at 1920 scale)
const scrollXBase = (f: number) => {
  const fast  = 50;    // initial burst speed (px/frame)
  const floor = 1.5;   // minimum cruising speed (px/frame)
  const decay = 0.035; // lower = fast phase lasts longer
  return (fast / decay) * (1 - Math.exp(-decay * f)) + floor * f;
};

// ── Timing ────────────────────────────────────────────────────────────────────
const TEXT_START      = 60;   // all text appears together with char fade
const BADGES_START    = 160;  // badges spring out after text is in
const EXIT_START   = 300;
const EXIT_END     = 320;

// Strip dims slightly once text overlays it so text stays readable
const PHASE1_DIM_START = TEXT_START;
const PHASE1_DIM_END   = TEXT_START + 20;

// ── CharFade ─────────────────────────────────────────────────────────────────

// Renders text with per-character staggered fade-in starting at `startFrame`
const CHAR_STAGGER = 1.4; // frames between each character's fade
const CHAR_FADE    = 8;   // frames to fade each character from 0→1

const CharFade: React.FC<{
  text: string;
  frame: number;
  startFrame: number;
  style: React.CSSProperties;
  charOffset?: number; // global char index offset for cross-line stagger
}> = ({ text, frame, startFrame, style, charOffset = 0 }) => {
  return (
    <span style={{ ...style, opacity: 1 }}>
      {text.split('').map((char, i) => {
        const charStart = startFrame + (charOffset + i) * CHAR_STAGGER;
        const opacity = Math.min(1, Math.max(0, (frame - charStart) / CHAR_FADE));
        return (
          <span key={i} style={{ opacity }}>
            {char}
          </span>
        );
      })}
    </span>
  );
};

// ── Icon Panel ───────────────────────────────────────────────────────────────

type PhosphorIcon = React.FC<{ size: number; color: string }>;

const ICON_ITEMS: PhosphorIcon[] = [
  Image as PhosphorIcon,
  PenNib as PhosphorIcon,
  Aperture as PhosphorIcon,
  Person as PhosphorIcon,
  Mountains as PhosphorIcon,
  Cube as PhosphorIcon,
  Palette as PhosphorIcon,
  Shapes as PhosphorIcon,
];

const IconPanel: React.FC<{ size: number }> = ({ size }) => (
  <div style={{
    width: size,
    borderRadius: 20,
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    padding: '16px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: 10,
  }}>
    {ICON_ITEMS.map((Icon, i) => (
      <div key={i} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: '14px 0',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Icon size={Math.round(size * 0.12)} color="rgba(255,255,255,0.75)" />
      </div>
    ))}
  </div>
);

// ── Hero text ─────────────────────────────────────────────────────────────────

// Badges fly from center to fixed corner positions
// stackImg: optional second image rendered overlapping bottom-right
const BADGES: { img: string; labelKey: 'colors' | 'logos' | 'typography' | 'imageAssets' | 'brandVoice'; desc?: string; pillTop?: boolean; pillRight?: boolean; pillOffsetX?: number; pillOffsetY?: number; pillFontSize?: number; appearAt: number; tx: number; ty: number; portraitTx?: number; portraitTy?: number; floatAmp: number; floatPhase: number; tilt: number; size: number; stackImg?: string; whiteBorder?: boolean; noBg?: boolean; iconPanel?: boolean; imagePanel?: boolean }[] = [
  // Landscape positions (tx/ty) are offsets from canvas center at 1920×1080.
  // Portrait positions (portraitTx/portraitTy) target distinct screen zones to avoid overlap.
  { img: 'badge-01.png', labelKey: 'colors' as const,       appearAt: 160, tx:  535, ty: -300, portraitTx:  540, portraitTy: -160, floatAmp: 12, floatPhase: 0,   tilt: -6,  size: 230, pillOffsetX: -50, pillOffsetY: 70 },
  { img: 'badge-02.png', labelKey: 'logos' as const,        appearAt: 178, tx:  680, ty:   10, portraitTx: -580, portraitTy: -140, floatAmp:  9, floatPhase: 1.6, tilt:  5,  size: 250, whiteBorder: false },
  { img: 'badge-05.png', labelKey: 'typography' as const,   appearAt: 196, tx:  350, ty:  270, portraitTx:  480, portraitTy:  150, floatAmp: 11, floatPhase: 2.3, tilt:  8,  size: 160, whiteBorder: false, pillOffsetY: -20, pillFontSize: 18 },
  { img: 'character.png', labelKey: 'imageAssets' as const, appearAt: 229, tx: -600, ty: -220, portraitTx: -400, portraitTy: -260, floatAmp: 14, floatPhase: 3.1, tilt: -5,  size: 190, pillOffsetX: 30, pillFontSize: 18 },
  { img: 'badge-04.png', labelKey: 'brandVoice' as const,  appearAt: 262, tx: -600, ty:  280, portraitTx: -450, portraitTy:  160, floatAmp: 10, floatPhase: 4.7, tilt: -12, size: 270, whiteBorder: false, noBg: true, pillTop: true, pillRight: true, pillOffsetY: 55, pillOffsetX: 55 },
];

// ── Image Panel ──────────────────────────────────────────────────────────────

const PANEL_IMAGES = [
  'slides/slide_01.jpg',
  'character_01.jpg',
  'slides/slide_02.jpg',
  'composition.jpg',
];

const ImagePanel: React.FC<{ size: number }> = ({ size }) => (
  <div style={{
    width: size,
    borderRadius: 20,
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    padding: 10,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: 8,
  }}>
    {PANEL_IMAGES.map((src, i) => (
      <div key={i} style={{ borderRadius: 10, overflow: 'hidden', aspectRatio: '1' }}>
        <PostImg filename={src} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

export const BrandKitHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, scale, isPortrait } = useVideoScale();
  const theme = useTheme();
  const s = useBrandKitStrings();

  // Scale wave geometry to canvas size
  // In portrait, cards are slightly wider (fill 1080px better) and rows span the full height
  const cardW    = isPortrait ? CARD_W_BASE * scale * 1.15 : CARD_W_BASE * scale;
  const cardGap  = CARD_GAP_BASE * scale;
  const stride   = cardW + cardGap;
  const waveAmp  = WAVE_AMP_BASE * scale;
  const waveLen  = WAVE_LEN_BASE * scale;
  const scrollX  = (f: number) => scrollXBase(f) * scale;
  // Portrait: single row centered at 50% height; landscape: row near top
  const rowYs = [h * (isPortrait ? PORTRAIT_ROW_Y_RATIO : ROW_Y_RATIO) - (isPortrait ? 100 * scale : 0)];

  const sceneOpacity = interpolate(frame, [0, EXIT_START, EXIT_END], [1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── Phase 1: wave strip opacity ───────────────────────────────────────────

  // Strip stays visible but dims to 30% once text overlays it
  const stripOpacity = interpolate(frame, [PHASE1_DIM_START, PHASE1_DIM_END], [1, 0.12], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── Phase 2: text ─────────────────────────────────────────────────────────

  const exitOp = interpolate(frame, [EXIT_START, EXIT_END], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Phase 2: badge orbit ───────────────────────────────────────────────────

  const badgeAnims = BADGES.map((b) => {
    const localF      = Math.max(0, frame - b.appearAt);
    const entrySpring = spring({ frame: localF, fps, config: { stiffness: 75, damping: 14 } });
    const opacity     = interpolate(localF, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const floatAmpScaled = b.floatAmp * scale;
    // Badge positions are canvas-relative offsets from center — scale by canvas size, not element scale.
    // In portrait, use per-badge portrait overrides to spread badges to distinct screen zones.
    const effectiveTx = isPortrait && b.portraitTx !== undefined ? b.portraitTx : b.tx;
    const effectiveTy = isPortrait && b.portraitTy !== undefined ? b.portraitTy : b.ty;
    const scaledTx = effectiveTx * (w / 1920);
    const scaledTy = effectiveTy * (h / 1080);
    const x = scaledTx * entrySpring + Math.sin((frame / 80) * Math.PI * 2 + b.floatPhase) * floatAmpScaled;
    const y = scaledTy * entrySpring + Math.cos((frame / 80) * Math.PI * 2 + b.floatPhase) * floatAmpScaled;
    // Scale badges 25% smaller in portrait so they don't crowd the canvas
    const badgeSize = b.size * (isPortrait ? 0.75 : 1.0) * scale;
    const labelMap: Record<string, string> = {
      colors: s.hookBadge_colors,
      logos: s.hookBadge_logos,
      typography: s.hookBadge_typography,
      imageAssets: s.hookBadge_imageAssets,
      brandVoice: s.hookBadge_brandVoice,
    };
    return { opacity, x, y, rotate: b.tilt, size: badgeSize, label: labelMap[b.labelKey] ?? b.labelKey, desc: b.desc, pillTop: b.pillTop, stackImg: b.stackImg, pillFontSize: b.pillFontSize ?? 26 };
  });

  return (
    <AbsoluteFill style={{ background: '#2a2a2a', opacity: sceneOpacity, overflow: 'hidden' }}>

      {/* ── Phase 1: single sliding wave row (centered vertically in portrait) ── */}
      <div style={{ position: 'absolute', inset: 0, opacity: stripOpacity }}>
        {Array.from({ length: CARDS_PER_ROW }, (_, col) => {
          const rowY  = rowYs[0];
          const startX = (col - 1) * stride;
          const cardX  = startX - scrollX(frame);
          const waveY  = waveAmp * Math.sin(
            (cardX / waveLen) * Math.PI * 2 + frame * WAVE_SPEED
          );
          const cardY = rowY + waveY - cardW * 0.56 / 2; // vertically center card on rowY

          return (
            <div
              key={col}
              style={{
                position: 'absolute',
                left: cardX,
                top:  cardY,
                width: cardW,
                borderRadius: 18,
                overflow: 'hidden',
                border: `1px solid ${theme.colors.glassBorder}`,
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              }}
            >
              {WAVE_IMAGES.length > 0 ? (
                <PostImg
                  filename={WAVE_IMAGES[col % WAVE_IMAGES.length]}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: 400,
                  background: `linear-gradient(135deg, #1a1a1a 0%, #222 50%, #1a1a1a 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 18,
                    color: 'rgba(255,255,255,0.15)',
                    fontWeight: 500,
                  }}>Image {(col % 22) + 1}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Radial vignette — dark center over the cards ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 55% 48% at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.75) 65%, rgba(0,0,0,0.55) 100%)',
          opacity: interpolate(frame, [TEXT_START, TEXT_START + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          pointerEvents: 'none',
        }}
      />

      {/* ── Phase 2: hero text — all lines at once, per-character fade ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        opacity: exitOp,
        textAlign: 'center',
        padding: `0 ${40 * scale}px`,
      }}>
        {/* Constrain text to canvas width so nothing overflows */}
        <div style={{ maxWidth: w - 80 * scale, width: '100%' }}>
          {/* Line 1 */}
          <CharFade
            text={s.hookLine1}
            frame={frame}
            startFrame={TEXT_START}
            charOffset={0}
            style={{
              fontFamily: theme.font.family,
              fontSize: (isPortrait ? 88 : 84) * scale,
              fontWeight: 600,
              color: theme.colors.white,
              letterSpacing: -2,
              lineHeight: 1.1,
              display: 'block',
              whiteSpace: 'nowrap',
            }}
          />
          {/* Line 1b (optional — portrait break) */}
          {s.hookLine1b && (
            <CharFade
              text={s.hookLine1b}
              frame={frame}
              startFrame={TEXT_START}
              charOffset={s.hookLine1.length}
              style={{
                fontFamily: theme.font.family,
                fontSize: (isPortrait ? 88 : 84) * scale,
                fontWeight: 600,
                color: theme.colors.white,
                letterSpacing: -2,
                lineHeight: 1.1,
                display: 'block',
                whiteSpace: 'nowrap',
              }}
            />
          )}
          {/* Line 2: "Your" (white) + "Brand Identity" (pink) */}
          {(() => {
            const line1bLen = s.hookLine1b?.length ?? 0;
            return (
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, justifyContent: 'center', gap: 0, marginTop: 4 }}>
                <CharFade
                  text={s.hookLine2a}
                  frame={frame}
                  startFrame={TEXT_START}
                  charOffset={s.hookLine1.length + line1bLen}
                  style={{
                    fontFamily: theme.font.family,
                    fontSize: (isPortrait ? 88 : 84) * scale,
                    fontWeight: 600,
                    color: theme.colors.white,
                    letterSpacing: -2,
                    lineHeight: 1.1,
                    display: 'block',
                    marginRight: 20 * scale,
                    whiteSpace: 'nowrap',
                  }}
                />
                <CharFade
                  text={s.hookLine2b}
                  frame={frame}
                  startFrame={TEXT_START}
                  charOffset={s.hookLine1.length + line1bLen + s.hookLine2a.length + 1}
                  style={{
                    fontFamily: theme.font.family,
                    fontSize: (isPortrait ? 88 : 84) * scale,
                    fontWeight: 600,
                    color: theme.colors.accentPink,
                    letterSpacing: -2,
                    lineHeight: 1.1,
                    display: 'block',
                    whiteSpace: 'nowrap',
                  }}
                />
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Phase 2: orbiting badge images ── */}
      {BADGES.map((b, i) => {
        const anim = badgeAnims[i];
        return (
          <div
            key={b.img}
            style={{
              position: 'absolute',
              left: w / 2 + anim.x,
              top:  h / 2 + anim.y,
              transform: `translate(-50%, -50%)`,
              opacity: anim.opacity,
            }}
          >
            {/* Image(s) */}
            <div style={{ position: 'relative', width: anim.size, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.7))' }}>
              {/* Main image, icon panel, or image panel */}
              {b.iconPanel ? (
                <IconPanel size={anim.size} />
              ) : b.imagePanel ? (
                <ImagePanel size={anim.size} />
              ) : (
                <div style={{
                  width: '100%',
                  borderRadius: b.noBg ? 0 : 20,
                  overflow: 'hidden',
                  border: b.noBg ? 'none' : b.whiteBorder ? '4px solid rgba(255,255,255,0.85)' : `1px solid ${theme.colors.glassBorder}`,
                  boxShadow: b.noBg ? 'none' : '0 12px 40px rgba(0,0,0,0.5)',
                  background: b.noBg ? 'transparent' : undefined,
                }}>
                  <PostImg
                    filename={`badges/${b.img}`}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              )}
              {/* Stack image — overlaps bottom-right corner */}
              {anim.stackImg && (
                <div style={{
                  position: 'absolute',
                  bottom: -60,
                  right: -80,
                  width: '65%',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: `2px solid ${theme.colors.bgDark}`,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                }}>
                  <PostImg
                    filename={anim.stackImg}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              )}
            </div>
            {/* Label pill — left of image for desc badges, bottom-overlap for others */}
            <div style={{
              position: 'absolute',
              ...(anim.pillTop ? { top: -20 + (b.pillOffsetY ?? 0) } : { bottom: -20 + (b.pillOffsetY ?? 0) }),
              ...(b.pillRight ? { right: 12 - (b.pillOffsetX ?? 0) } : { left: 12 + (b.pillOffsetX ?? 0) }),
              background: 'rgba(255,255,255,0.96)',
              borderRadius: anim.desc ? 20 : 100,
              padding: anim.desc ? '14px 18px' : '10px 24px',
              whiteSpace: anim.desc ? 'normal' : 'nowrap',
              maxWidth: anim.desc ? 400 : undefined,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}>
              {!anim.desc && (
                <span style={{
                  fontFamily: theme.font.family,
                  fontSize: anim.pillFontSize * scale,
                  fontWeight: 600,
                  color: '#111',
                  letterSpacing: 0.1,
                }}>
                  {anim.label}
                </span>
              )}
              {anim.desc && (
                <span style={{
                  fontFamily: theme.font.family,
                  fontSize: anim.pillFontSize * scale,
                  fontWeight: 600,
                  color: '#111',
                  letterSpacing: 0.2,
                }}>
                  {anim.desc}
                </span>
              )}
            </div>
          </div>
        );
      })}

    </AbsoluteFill>
  );
};
