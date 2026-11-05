import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { CursorKeyframe } from '../../../types';
import { positionAt } from '../../../lib/animations';
import CursorSVG from './CursorSVG';
import ClickRipple from './ClickRipple';

interface CursorProps {
  keyframes:        CursorKeyframe[];
  containerWidth?:  number;
  containerHeight?: number;
  size?:            number;
}

function fadeInVal(frame: number, from: number, duration: number): number {
  return Math.min(1, Math.max(0, (frame - from) / duration));
}

function fadeOutVal(frame: number, until: number, duration: number): number {
  return Math.min(1, Math.max(0, 1 - (frame - until) / duration));
}

export const Cursor: React.FC<CursorProps> = ({
  keyframes,
  containerWidth  = 1920,
  containerHeight = 1080,
  size            = 2.8,
}) => {
  const frame = useCurrentFrame();
  useVideoConfig(); // keep hook call consistent

  if (keyframes.length === 0) return null;

  const sortedKFs = [...keyframes].sort((a, b) => a.frame - b.frame);
  const firstKF   = sortedKFs[0];
  const lastKF    = sortedKFs[sortedKFs.length - 1];

  if (frame < firstKF.frame || frame > lastKF.frame + 30) return null;

  // ── Current position ──────────────────────────────────────────────────────

  const { x: cursorX, y: cursorY } = positionAt(frame, sortedKFs);
  const pixelX = cursorX * containerWidth;
  const pixelY = cursorY * containerHeight;

  // ── Velocity → tilt ───────────────────────────────────────────────────────

  const { x: prevX, y: prevY } = positionAt(frame - 3, sortedKFs);
  const velX  = (cursorX - prevX) * containerWidth;
  const velY  = (cursorY - prevY) * containerHeight;
  const speed = Math.sqrt(velX * velX + velY * velY);

  const rawTilt = speed > 0.5 ? (velX / Math.max(speed, 1)) * 18 : 0;
  const tiltDeg = Math.max(-18, Math.min(18, rawTilt));

  // ── Click state ───────────────────────────────────────────────────────────

  const clickFrames  = sortedKFs.filter((kf) => kf.click).map((kf) => kf.frame);
  const nearestClick = clickFrames.find((cf) => Math.abs(frame - cf) <= 4);
  const pressed      = nearestClick !== undefined;

  const pressT = nearestClick !== undefined ? Math.abs(frame - nearestClick) / 4 : 1;
  const squish = pressed
    ? interpolate(pressT, [0, 0.5, 1], [0.75, 0.82, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      })
    : 1;

  // ── Opacity ───────────────────────────────────────────────────────────────

  const cursorOpacity = Math.min(
    fadeInVal(frame, firstKF.frame, 10),
    fadeOutVal(frame, lastKF.frame + 8, 16),
  );

  // ── Motion trail — dark dots ──────────────────────────────────────────────

  const TRAIL_LEN = 5;
  const trail: Array<{ x: number; y: number; age: number }> = [];
  for (let lag = TRAIL_LEN; lag >= 1; lag--) {
    const pf = frame - lag;
    if (pf < firstKF.frame) continue;
    const pos = positionAt(pf, sortedKFs);
    trail.push({ x: pos.x * containerWidth, y: pos.y * containerHeight, age: lag });
  }

  return (
    <div
      style={{
        position:      'absolute',
        top:           0,
        left:          0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        100,
      }}
    >
      {/* Motion trail */}
      {trail.map((dot, i) => {
        const dotOpacity = interpolate(dot.age, [1, TRAIL_LEN], [0.22, 0.04]) * cursorOpacity;
        const dotSize    = interpolate(dot.age, [1, TRAIL_LEN], [8, 2]);
        return (
          <div
            key={i}
            style={{
              position:     'absolute',
              left:         dot.x,
              top:          dot.y,
              width:        dotSize,
              height:       dotSize,
              borderRadius: '50%',
              background:   'rgba(0,0,0,0.55)',
              transform:    'translate(-50%, -50%)',
              opacity:      dotOpacity,
            }}
          />
        );
      })}

      {/* Click ripples — anchored to where the click occurred */}
      {clickFrames.map((cf, i) => {
        const { x: cfX, y: cfY } = positionAt(cf, sortedKFs);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left:     cfX * containerWidth,
              top:      cfY * containerHeight,
            }}
          >
            <ClickRipple clickFrame={cf} frame={frame} />
          </div>
        );
      })}

      {/* Cursor */}
      <div
        style={{
          position:        'absolute',
          left:            pixelX,
          top:             pixelY,
          transform:       `scale(${squish})`,
          opacity:         cursorOpacity,
          transformOrigin: '5px 3px',
          willChange:      'transform',
        }}
      >
        <CursorSVG scale={size} pressed={pressed} tiltDeg={tiltDeg} />
      </div>
    </div>
  );
};
