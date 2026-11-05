// src/components/scenes/brandkit/BrandKitCTA.tsx
// Scene 6 — CTA (local frames 0–180)
// "[logo] LayerProof Brand Kit" rolls up + URL fades in

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import { useBrandKitStrings } from './BrandKitLangContext';
import { useVideoScale } from '../../../lib/scale';

const INTER = '"Inter", "SF Pro Display", -apple-system, sans-serif';
const PINK  = '#FF589B';

const ENTER_START    = 5;
const FADE_OUT_START = 158;
const FADE_OUT_END   = 180;

export const BrandKitCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useBrandKitStrings();
  const { scale } = useVideoScale();

  const sceneOpacity = interpolate(frame, [FADE_OUT_START, FADE_OUT_END], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Roll up from bottom
  const enterSpring = spring({ frame: Math.max(0, frame - ENTER_START), fps, config: { stiffness: 72, damping: 18 } });
  const enterY      = interpolate(enterSpring, [0, 1], [120 * scale, 0]);
  const enterOp     = interpolate(frame, [ENTER_START, ENTER_START + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Nudge bounce after roll-up settles
  const NUDGE_START = ENTER_START + 32;
  const NUDGE_PEAK  = 1.05;
  const nudgeAge    = Math.max(0, frame - NUDGE_START);
  const upT         = Math.min(1, nudgeAge / 5);
  const nudgeUp     = 1 + (NUDGE_PEAK - 1) * (1 - Math.pow(1 - upT, 2));
  const nudgeDownS  = spring({ frame: Math.max(0, nudgeAge - 5), fps, config: { stiffness: 180, damping: 22 } });
  const nudgeDown   = interpolate(nudgeDownS, [0, 1], [NUDGE_PEAK, 1.0]);
  const nudgeScale  = nudgeAge <= 5 ? nudgeUp : nudgeDown;

  return (
    <AbsoluteFill style={{ background: '#080808', opacity: sceneOpacity }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 88% 78% at 50% 50%, transparent 52%, rgba(0,0,0,0.4) 100%)',
        pointerEvents: 'none',
      }} />

      {/* "[logo] LayerProof Brand Kit" + URL */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: enterOp,
        transform: `translateY(${enterY}px)`,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          transform: `scale(${nudgeScale})`,
          transformOrigin: 'center bottom',
        }}>
          <img
            src={staticFile('layerproof-symbol.png')}
            alt=""
            style={{ width: 76 * scale, height: 76 * scale, objectFit: 'contain', marginRight: 14 * scale, flexShrink: 0 }}
          />
          <span style={{ fontFamily: INTER, fontSize: 78 * scale, fontWeight: 600, color: '#FFFFFF', letterSpacing: -1, lineHeight: 1 }}>
            {s.ctaBrand}
          </span>
          <span style={{ fontFamily: INTER, fontSize: 78 * scale, fontWeight: 600, color: PINK, letterSpacing: -1, lineHeight: 1, marginLeft: 14 * scale }}>
            {s.ctaAccent}
          </span>
        </div>

      </div>
    </AbsoluteFill>
  );
};
