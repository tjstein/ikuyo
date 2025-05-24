export const ThemeAppearance = {
  Light: 'light',
  Dark: 'dark',
} as const;
export type ThemeAppearanceType =
  (typeof ThemeAppearance)[keyof typeof ThemeAppearance];
