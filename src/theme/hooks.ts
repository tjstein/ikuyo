import { useEffect } from 'react';
import { useBoundStore, useDeepBoundStore } from '../data/store';
import { ThemeAppearance, type ThemeAppearanceType } from './constants';

// https://stackoverflow.com/questions/59621784/how-to-detect-prefers-color-scheme-change-in-javascript
// https://stackoverflow.com/questions/77024306/radix-ui-theme-dark-mode-not-being-applied
export function useTheme(): ThemeAppearanceType {
  const theme = useDeepBoundStore((state) => state.currentTheme);
  return theme;
}
export function useSubscribeTheme() {
  const setTheme = useBoundStore((state) => state.setTheme);
  useEffect(() => {
    const darkThemeListener = (ev: MediaQueryListEvent) => {
      if (ev.matches) {
        setTheme(ThemeAppearance.Dark);
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
      }
    };
    const lightThemeListener = (ev: MediaQueryListEvent) => {
      if (ev.matches) {
        setTheme(ThemeAppearance.Light);
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
      }
    };
    const darkMatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const lightMatchMedia = window.matchMedia('(prefers-color-scheme: light)');
    if (darkMatchMedia.matches) {
      setTheme(ThemeAppearance.Dark);
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else if (lightMatchMedia.matches) {
      setTheme(ThemeAppearance.Light);
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
    darkMatchMedia.addEventListener('change', darkThemeListener);
    lightMatchMedia.addEventListener('change', lightThemeListener);
    return () => {
      darkMatchMedia.removeEventListener('change', darkThemeListener);
      lightMatchMedia.removeEventListener('change', lightThemeListener);
    };
  }, [setTheme]);
}
