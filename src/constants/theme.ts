/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#3A2A22',
    textSecondary: 'rgba(58, 42, 34, 0.65)',
    background: '#FCEEE3',
    surface: '#F3DCCB',
    primary: '#E8927C',
    primaryPressed: '#B57261',
    primaryShadow: '#8E4E3B',
    onPrimary: '#FFFFFF',
    border: '#D9C6B8',
    // Identity colors for the per-review gender picker — stable across
    // themes, like `primary`, so the same gender always reads the same way.
    genderBoy: '#8EB8E8',
    genderGirl: '#E88EB4',
    genderBoth: '#C08EE8',
  },
  dark: {
    text: '#F3E7DE',
    textSecondary: 'rgba(243, 231, 222, 0.65)',
    background: '#1C1512',
    surface: '#29201B',
    primary: '#E8927C',
    primaryPressed: '#F0AC98',
    primaryShadow: '#5C332A',
    onPrimary: '#1C1512',
    border: '#3D2F27',
    genderBoy: '#8EB8E8',
    genderGirl: '#E88EB4',
    genderBoth: '#C08EE8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const TopTabInset = Platform.select({ web: 64 }) ?? 0;
export const MaxContentWidth = 800;
