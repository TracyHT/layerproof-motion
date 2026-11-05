// src/compositions/LayerProofBrandKitTikTok.tsx
// LayerProof Brand Kit — TikTok 9:16 (1080×1920) version
// Scenes are natively responsive via useVideoScale() — no CSS wrapper needed.

import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { ThemeProvider } from '../lib/theme';
import { boldTheme } from '../lib/themes/bold';
import { BrandKitLangProvider } from '../components/scenes/brandkit/BrandKitLangContext';
import { en } from '../components/scenes/brandkit/BrandKitStrings';
import { BrandKitHook }      from '../components/scenes/brandkit/BrandKitHook';
import { BrandKitSecret }    from '../components/scenes/brandkit/BrandKitSecret';
import { BrandKitSuite }     from '../components/scenes/brandkit/BrandKitSuite';
import { BrandKitExecution } from '../components/scenes/brandkit/BrandKitExecution';
import { BrandKitOutput }    from '../components/scenes/brandkit/BrandKitOutput';
import { BrandKitCTA }       from '../components/scenes/brandkit/BrandKitCTA';

export const LayerProofBrandKitTikTok: React.FC = () => (
  <ThemeProvider theme={boldTheme}>
    <BrandKitLangProvider strings={en}>
      <AbsoluteFill style={{ background: '#080808' }}>

        {/* Scene 1: Hook — 0–320f */}
        <Sequence from={0} durationInFrames={320}>
          <BrandKitHook />
        </Sequence>

        {/* Scene 2: Brand Kit Import — 290–901f */}
        <Sequence from={290} durationInFrames={611}>
          <BrandKitSecret tiktok />
        </Sequence>

        {/* Scene 3: Creative Suite Unlock — 865–1040f */}
        <Sequence from={865} durationInFrames={175}>
          <BrandKitSuite tiktok />
        </Sequence>

        {/* Scene 4: Prompt + Theme Selection — 1025–1415f */}
        <Sequence from={1025} durationInFrames={390}>
          <BrandKitExecution tiktok />
        </Sequence>

        {/* Scene 5: Split Output — 1415–1625f */}
        <Sequence from={1415} durationInFrames={210}>
          <BrandKitOutput tiktok />
        </Sequence>

        {/* Scene 6: CTA — 1610–1790f */}
        <Sequence from={1610} durationInFrames={180}>
          <BrandKitCTA />
        </Sequence>

      </AbsoluteFill>
    </BrandKitLangProvider>
  </ThemeProvider>
);
