// src/compositions/LayerProofBrandKit.tsx
// LayerProof Brand Kit — Feature video (~54s)
// 6-scene narrative: Hook → Secret → Suite → Execution → Output → CTA

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
import { BrandKitCTA }      from '../components/scenes/brandkit/BrandKitCTA';

export const LayerProofBrandKit: React.FC = () => (
  <ThemeProvider theme={boldTheme}>
    <BrandKitLangProvider strings={en}>
      <AbsoluteFill style={{ background: '#080808' }}>

        {/* Scene 1: Hook — 0–320f */}
        <Sequence from={0} durationInFrames={320}>
          <BrandKitHook />
        </Sequence>

        {/* Scene 2: Brand Kit Import — 290–901f (30f crossfade with Scene 1) */}
        <Sequence from={290} durationInFrames={611}>
          <BrandKitSecret />
        </Sequence>

        {/* Scene 3: Creative Suite Unlock — 865–1060f (36f crossfade with Scene 2) */}
        <Sequence from={865} durationInFrames={195}>
          <BrandKitSuite />
        </Sequence>

        {/* Scene 4: Prompt + Theme Selection — 1045–1415f (15f crossfade with Scene 3) */}
        <Sequence from={1045} durationInFrames={370}>
          <BrandKitExecution />
        </Sequence>

        {/* Scene 5: Split Output — 1400–1610f (15f crossfade with Scene 4) */}
        <Sequence from={1400} durationInFrames={210}>
          <BrandKitOutput />
        </Sequence>

        {/* Scene 6: CTA — 1595–1775f (15f crossfade with Scene 5) */}
        <Sequence from={1595} durationInFrames={180}>
          <BrandKitCTA />
        </Sequence>

      </AbsoluteFill>
    </BrandKitLangProvider>
  </ThemeProvider>
);
