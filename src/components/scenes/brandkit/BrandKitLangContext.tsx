// src/components/scenes/brandkit/BrandKitLangContext.tsx
// Language context for Brand Kit scenes

import React from 'react';
import { en, type BrandKitStrings } from './BrandKitStrings';

const BrandKitLangContext = React.createContext<BrandKitStrings>(en);

export const BrandKitLangProvider: React.FC<{
  strings: BrandKitStrings;
  children: React.ReactNode;
}> = ({ strings, children }) => (
  <BrandKitLangContext.Provider value={strings}>
    {children}
  </BrandKitLangContext.Provider>
);

export const useBrandKitStrings = (): BrandKitStrings =>
  React.useContext(BrandKitLangContext);
