// src/components/scenes/brandkit/BrandKitOutput.tsx
// Scene 5 — Split Output (local frames 0–210)
// Portrait/TikTok: vertical stack — 3 social images row + presentation slide
// Landscape: side-by-side with Instagram wrapper carousel

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { easeIO3 } from '../../../lib/animations';
import { useTheme } from '../../../lib/theme';
import { useBrandKitStrings } from './BrandKitLangContext';
import { useVideoScale } from '../../../lib/scale';
import { staticFile } from 'remotion';
import Avatar from '../../ui/mockups/shared/Avatar';
import LogoAvatar from '../../ui/mockups/shared/LogoAvatar';
import ContentLines from '../../ui/mockups/shared/ContentLines';

const COL1_IN = 0;
const COL2_IN = 20;

export const BrandKitOutput: React.FC<{ tiktok?: boolean }> = ({ tiktok = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const s = useBrandKitStrings();
  const { w, h, scale, isPortrait } = useVideoScale();
  // TikTok and any portrait use vertical stack
  const isColumn = tiktok || isPortrait;

  const PINK   = theme.colors.accentPink   ?? '#FF589B';
  const YELLOW = theme.colors.accentYellow ?? '#FFD600';

  const cameraScale = (() => {
    if (frame <= 60) {
      const t = easeIO3(Math.min(1, frame / 60));
      return 1.02 - 0.09 * t;
    }
    return 0.93;
  })();
  const cameraTX = (w / 2 - 0.5 * w) * cameraScale;
  const cameraTY = (h / 2 - 0.5 * h) * cameraScale;

  const fadeInOp = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const PULSE_FRAMES = [70, 95] as const;
  const pulseMag = (peakFrame: number) => {
    const age = frame - peakFrame;
    if (age < 0 || age > 20) return 0;
    return interpolate(age, [0, 4, 12, 20], [0, 1, 0.4, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
  };

  const colDelays = [COL1_IN, COL2_IN];
  const colAnims = colDelays.map((delay) => {
    const sp = spring({ frame: Math.max(0, frame - delay), fps, config: { stiffness: 90, damping: 20 } });
    return {
      y:       interpolate(sp, [0, 1], [44, 0]),
      opacity: interpolate(Math.max(0, frame - delay), [0, 18], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      }),
    };
  });

  const ColLabel: React.FC<{ children: string }> = ({ children }) => (
    <div style={{
      display: 'inline-block',
      color: '#000000',
      fontFamily: theme.font.family,
      fontSize: 36 * scale,
      fontWeight: 600,
      background: '#ffffff',
      borderRadius: 999,
      padding: `${10 * scale}px ${28 * scale}px`,
      marginBottom: 16,
    }}>
      {children}
    </div>
  );

  const imageSrcs = [
    staticFile('social-posts/post_1.png'),
    staticFile('social-posts/post_2.png'),
    staticFile('social-posts/post_3.png'),
  ];
  const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

  // Landscape carousel swipe
  const SWIPE1_START = 70;  const SWIPE1_END = 100;
  const SWIPE2_START = 155; const SWIPE2_END = 185;
  const swipe1 = easeIO3(interpolate(frame, [SWIPE1_START, SWIPE1_END], [0, 1], clamp));
  const swipe2 = easeIO3(interpolate(frame, [SWIPE2_START, SWIPE2_END], [0, 1], clamp));
  const imgStripX = -(swipe1 + swipe2) * 100;
  const activeIndex = swipe1 < 0.5 ? 0 : swipe2 < 0.5 ? 1 : 2;

  const caption = s.outputCaption;
  const likes = Math.floor(
    interpolate(frame, [0, 60], [0, 2847], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  );

  const SIDE_PAD = 28 * scale;
  const imgGap   = 10 * scale;

  // ── Portrait: sliding center-featured carousel ──────────────────────────
  // 3 slots: left(MINI) | center(FEAT) | right(MINI)
  // Right image slides left to become center. The wrapping image (left→right):
  //   • instance A fades out in place (no slide = no edge clip glitch)
  //   • instance B slides in from off-screen right (fades in)
  const SWITCH1_START = 65;  const SWITCH1_END = 100;  // phase 0→1 (img2 → center)
  const SWITCH2_START = 140; const SWITCH2_END = 175;  // phase 1→2 (img0 → center)

  const switchT1 = easeIO3(interpolate(frame, [SWITCH1_START, SWITCH1_END], [0, 1], clamp));
  const switchT2 = easeIO3(interpolate(frame, [SWITCH2_START, SWITCH2_END], [0, 1], clamp));

  const TOTAL_IMG_W = w - 2 * SIDE_PAD;
  const FEAT_W = Math.round((TOTAL_IMG_W - 2 * imgGap) * 0.56);
  const MINI_W = Math.floor((TOTAL_IMG_W - FEAT_W - 2 * imgGap) / 2);

  const ROW_H  = FEAT_W + 4;  // +4 so border on center image doesn't clip at container edge
  const MINI_TOP = Math.round((ROW_H - MINI_W) / 2);

  const slotX = [0, MINI_W + imgGap, MINI_W + imgGap + FEAT_W + imgGap] as const;
  const slotW = [MINI_W, FEAT_W, MINI_W] as const;

  // phase 0: [img0→slot0, img1→slot1(C), img2→slot2]
  // phase 1: [img1→slot0, img2→slot1(C), img0→slot2]
  // phase 2: [img2→slot0, img0→slot1(C), img1→slot2]
  const IMG_SLOT_PHASES = [
    [0, 2, 1],
    [1, 0, 2],
    [2, 1, 0],
  ] as const;

  type ImgInst = { x: number; w: number; top: number; op: number };
  const cc = clamp;
  // Smooth vertical centering: as imgW grows toward FEAT_W the top offset shrinks to 0
  const topOf = (imgW: number) => Math.max(0, Math.round((ROW_H - imgW) / 2));

  // Returns 1 or 2 render instances for image i
  const getImgInstances = (i: number): ImgInst[] => {
    const [s0, s1, s2] = IMG_SLOT_PHASES[i];
    const p0 = { x: slotX[s0], w: slotW[s0] };
    const p1 = { x: slotX[s1], w: slotW[s1] };
    const p2 = { x: slotX[s2], w: slotW[s2] };

    const normalSlide = (t: number, from: typeof p0, to: typeof p0): ImgInst[] => {
      const tc = Math.min(1, Math.max(0, t));
      const iw = interpolate(tc, [0, 1], [from.w, to.w]);
      return [{ x: interpolate(tc, [0, 1], [from.x, to.x]), w: iw, top: topOf(iw), op: 1 }];
    };

    // Wrap: A fades out in place; B slides in from right and fades in
    const wrapTransition = (t: number, from: typeof p0, to: typeof p0): ImgInst[] => {
      const tc = Math.min(1, Math.max(0, t));
      // Exit: fade out in place (no sliding = no edge-clip artefact)
      const exitOp = interpolate(tc, [0, 0.4], [1, 0], cc);
      // Entry: slide in from off-screen right, grow to target size, fade in
      const entX  = interpolate(tc, [0, 1], [TOTAL_IMG_W + MINI_W, to.x], cc);
      const entW  = interpolate(tc, [0.3, 1], [MINI_W, to.w], cc);
      const entOp = interpolate(tc, [0.2, 0.65], [0, 1], cc);
      return [
        { x: from.x, w: from.w, top: MINI_TOP, op: exitOp },
        { x: entX,   w: entW,   top: topOf(entW), op: entOp },
      ];
    };

    const isWrap1 = s0 === 0 && s1 === 2;
    const isWrap2 = s1 === 0 && s2 === 2;

    if (switchT2 > 0) {
      // switchT1 is always 1 here — use p1 as the from position
      return isWrap2 ? wrapTransition(switchT2, p1, p2) : normalSlide(switchT2, p1, p2);
    } else {
      return isWrap1 ? wrapTransition(switchT1, p0, p1) : normalSlide(switchT1, p0, p1);
    }
  };

  // Landscape widths (unchanged)
  const instaW = 520 * scale;
  const slideW = Math.min(780 * scale, w - 56 * scale);

  return (
    <AbsoluteFill style={{ background: theme.colors.bgDark, overflow: 'hidden', opacity: fadeInOp }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: w, height: h,
        transform: `translate(${cameraTX}px, ${cameraTY}px) scale(${cameraScale})`,
        transformOrigin: 'center center',
      }}>

        {/* ── Layout container ── */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: isColumn ? 'column' : 'row' }}>

          {/* Section 1 — Social Post */}
          <div style={{
            flex: 1,
            borderRight: isColumn ? 'none' : `1px solid ${theme.colors.glassBorder}`,
            borderBottom: isColumn ? `1px solid ${theme.colors.glassBorder}` : 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isColumn ? 'flex-start' : 'center',
            justifyContent: 'center',
            padding: isColumn
              ? `${170 * scale}px ${SIDE_PAD}px ${24 * scale}px`
              : `${120 * scale}px ${SIDE_PAD}px ${32 * scale}px`,
            gap: 16,
            opacity: colAnims[0].opacity,
            transform: `translateY(${colAnims[0].y}px)`,
            position: 'relative',
            boxShadow: pulseMag(PULSE_FRAMES[0]) > 0
              ? `inset 0 0 40px ${PINK}${Math.round(pulseMag(PULSE_FRAMES[0]) * 40).toString(16).padStart(2, '0')}`
              : undefined,
          }}>
            <ColLabel>{s.outputColLabel_social}</ColLabel>

            {isColumn ? (
              /* ── Portrait/TikTok: sliding center-featured carousel ── */
              <div style={{ position: 'relative', width: TOTAL_IMG_W, height: ROW_H, overflow: 'hidden' }}>
                {imageSrcs.flatMap((src, i) =>
                  getImgInstances(i).map((inst, j) => {
                    const isFeat = inst.w > MINI_W + 4;
                    return (
                      <div
                        key={`${i}-${j}`}
                        style={{
                          position: 'absolute',
                          top: inst.top,
                          left: inst.x,
                          width: inst.w,
                          height: inst.w,
                          borderRadius: 12 * scale,
                          overflow: 'hidden',
                          opacity: inst.op,
                          border: isFeat ? '2px solid rgba(255,255,255,0.45)' : '1.5px solid rgba(255,255,255,0.15)',
                          boxShadow: isFeat ? '0 12px 40px rgba(0,0,0,0.65)' : 'none',
                        }}
                      >
                        <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* ── Landscape: Instagram wrapper with carousel ── */
              <div style={{
                width: instaW,
                background: '#000000',
                borderRadius: 12,
                border: '2px solid rgba(255,255,255,0.35)',
                outline: '1px solid rgba(255,255,255,0.08)',
                outlineOffset: 4,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                fontFamily: theme.font.family,
              }}>
                {/* Header */}
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      position: 'absolute', inset: -2, borderRadius: '50%',
                      background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
                      padding: 2,
                    }}>
                      <div style={{ background: '#000', borderRadius: '50%', padding: 2 }}>
                        <LogoAvatar size={30} />
                      </div>
                    </div>
                    <div style={{ width: 34, height: 34 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#e8e8e8', fontSize: 14, fontWeight: 600 }}>layerproof</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Sponsored</div>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 20, letterSpacing: 2 }}>···</div>
                </div>

                {/* Image strip */}
                <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    display: 'flex',
                    width: `${imageSrcs.length * 100}%`,
                    height: '100%',
                    transform: `translateX(calc(${imgStripX}% / ${imageSrcs.length}))`,
                  }}>
                    {imageSrcs.map((src, i) => (
                      <img key={i} src={src} style={{ width: `${100 / imageSrcs.length}%`, height: '100%', objectFit: 'cover', flexShrink: 0 }} />
                    ))}
                  </div>
                  <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
                    {imageSrcs.map((_, dot) => (
                      <div key={dot} style={{ width: dot === activeIndex ? 18 : 6, height: 6, borderRadius: 3, background: dot === activeIndex ? '#fff' : 'rgba(255,255,255,0.4)' }} />
                    ))}
                  </div>
                </div>

                {/* Action bar */}
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <svg width="24" height="22" viewBox="0 0 24 22" fill="none"><path d="M12 20.5C12 20.5 2 14 2 7.5C2 4.42 4.42 2 7.5 2C9.24 2 10.91 2.81 12 4.08C13.09 2.81 14.76 2 16.5 2C19.58 2 22 4.42 22 7.5C22 14 12 20.5 12 20.5Z" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" fill="none"/></svg>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2C6.03 2 2 5.58 2 10C2 12.05 2.86 13.92 4.27 15.35L3 20L7.9 18.36C8.88 18.77 9.92 19 11 19C15.97 19 20 15.42 20 11C20 6.58 15.97 2 11 2Z" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" fill="none"/></svg>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M22 11L2 2L7 11L2 20L22 11Z" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinejoin="round" fill="none"/></svg>
                  <div style={{ marginLeft: 'auto' }}><svg width="20" height="22" viewBox="0 0 20 22" fill="none"><path d="M17 2H3C2.45 2 2 2.45 2 3V20L10 17L18 20V3C18 2.45 17.55 2 17 2Z" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" fill="none"/></svg></div>
                </div>

                <div style={{ padding: '0 16px 6px', fontSize: 14, fontWeight: 600, color: '#e8e8e8' }}>{likes.toLocaleString()} {s.outputLikes}</div>
                <div style={{ padding: '0 16px 10px', overflow: 'hidden' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginRight: 6 }}>layerproof</span>
                  <ContentLines lines={caption} charsToShow={200} fontSize={14} color="rgba(255,255,255,0.75)" />
                </div>
                <div style={{ padding: '0 16px 10px' }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{s.outputComments}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>{s.outputCommentsAgo}</div>
                </div>
                <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar initials="U" color="rgba(255,255,255,0.2)" size={24} />
                  <div style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{s.outputAddComment}</div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2 — Presentation Slide */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: isColumn ? 'flex-start' : 'center',
            justifyContent: 'center',
            padding: isColumn
              ? `${24 * scale}px ${SIDE_PAD}px ${48 * scale}px`
              : `${32 * scale}px ${SIDE_PAD}px`,
            gap: 16,
            opacity: colAnims[1].opacity,
            transform: `translateY(${colAnims[1].y}px)`,
            position: 'relative',
            boxShadow: undefined,
          }}>
            <ColLabel>{s.outputColLabel_presentation}</ColLabel>

            <img
              src={staticFile('brandkit/slide_placeholder.png')}
              style={{
                width: isColumn ? w - 2 * SIDE_PAD : slideW,
                aspectRatio: '16 / 9',
                objectFit: 'cover',
                borderRadius: 14 * scale,
                border: `2px solid rgba(255,255,255,0.35)`,
                outline: `1px solid rgba(255,255,255,0.08)`,
                outlineOffset: 4,
                display: 'block',
              }}
            />
          </div>

        </div>

        {/* ── "100% Brand Consistency" top header ── */}
        <div style={{
          position: 'absolute', top: 52 * scale, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 10,
          opacity: colAnims[0].opacity, pointerEvents: 'none',
        }}>
          <span style={{ color: PINK, fontFamily: theme.font.family, fontSize: 80 * scale, fontWeight: 600, letterSpacing: -1 }}>{s.outputHeadlineAccent}</span>
          <span style={{ color: theme.colors.white, fontFamily: theme.font.family, fontSize: 80 * scale, fontWeight: 600, letterSpacing: -1 }}>{s.outputHeadlineBody}</span>
        </div>

      </div>
    </AbsoluteFill>
  );
};
