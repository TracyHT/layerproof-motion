// src/compositions/LayerProofBrandKitVI.tsx
// LayerProof Brand Kit — Vietnamese version (~54s)
// Identical structure to LayerProofBrandKit, text localised to Vietnamese

import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { ThemeProvider } from '../lib/theme';
import { boldTheme } from '../lib/themes/bold';
import { BrandKitLangProvider } from '../components/scenes/brandkit/BrandKitLangContext';
import { vi } from '../components/scenes/brandkit/BrandKitStrings';
import { BrandKitHook }      from '../components/scenes/brandkit/BrandKitHook';
import { BrandKitSecret }    from '../components/scenes/brandkit/BrandKitSecret';
import { BrandKitSuite }     from '../components/scenes/brandkit/BrandKitSuite';
import { BrandKitExecution } from '../components/scenes/brandkit/BrandKitExecution';
import { BrandKitOutput }    from '../components/scenes/brandkit/BrandKitOutput';
import { BrandKitCTA }      from '../components/scenes/brandkit/BrandKitCTA';

export const LayerProofBrandKitVI: React.FC = () => (
  <ThemeProvider theme={boldTheme}>
    <BrandKitLangProvider strings={vi}>
      <AbsoluteFill style={{ background: '#080808' }}>

        {/* Scene 1: Hook — 0–320f */}
        <Sequence from={0} durationInFrames={320}>
          <BrandKitHook />
        </Sequence>

        {/* Scene 2: Brand Kit Import — 290–886f (30f crossfade with Scene 1) */}
        <Sequence from={290} durationInFrames={596}>
          <BrandKitSecret />
        </Sequence>

        {/* Scene 3: Creative Suite Unlock — 850–1045f (36f crossfade with Scene 2) */}
        <Sequence from={850} durationInFrames={195}>
          <BrandKitSuite />
        </Sequence>

        {/* Scene 4: Prompt + Theme Selection — 1030–1400f (15f crossfade with Scene 3) */}
        <Sequence from={1030} durationInFrames={370}>
          <BrandKitExecution />
        </Sequence>

        {/* Scene 5: Split Output — 1385–1595f (15f crossfade with Scene 4) */}
        <Sequence from={1385} durationInFrames={210}>
          <BrandKitOutput />
        </Sequence>

        {/* Scene 6: CTA — 1580–1760f (15f crossfade with Scene 5) */}
        <Sequence from={1580} durationInFrames={180}>
          <BrandKitCTA />
        </Sequence>

      </AbsoluteFill>
    </BrandKitLangProvider>
  </ThemeProvider>
);
