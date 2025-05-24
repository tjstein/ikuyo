import type { StateCreator } from 'zustand';
import type { BoundStoreType } from '../data/store';
import { ThemeAppearance, type ThemeAppearanceType } from './constants';

export interface ThemeSlice {
  setTheme: (theme: ThemeAppearanceType) => void;
  currentTheme: ThemeAppearanceType;
}

export const createThemeSlice: StateCreator<
  BoundStoreType,
  [],
  [],
  ThemeSlice
> = (set) => {
  return {
    currentTheme: ThemeAppearance.Light,
    setTheme: (theme) => {
      set({
        currentTheme: theme,
      });
    },
  };
};
