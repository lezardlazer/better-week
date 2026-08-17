// Mirrors tailwind.config.js. Native shadow props (used by NeumorphicSurface)
// can't be expressed as Tailwind classes on iOS/Android, so those colors are
// also exposed here as plain values.

export const colors = {
  base: '#EDEDF0',
  surface: '#EDEDF0',
  ink: '#141416',
  muted: '#6B6B70',
  bauhaus: {
    blue: '#3355D8',
    yellow: '#E8A93B',
    red: '#D8473B',
  },
  shadow: {
    light: 'rgba(255, 255, 255, 0.75)',
    dark: 'rgba(163, 163, 168, 0.55)',
  },
  todayHighlight: 'rgba(51, 85, 216, 0.08)',
  completedHighlight: '#F6E9C9',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  title: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '500' as const, letterSpacing: 0.6 },
} as const;
