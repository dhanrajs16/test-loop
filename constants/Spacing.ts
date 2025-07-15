/**
 * Global Spacing System
 * Update spacing values here to change them throughout the app
 */

export const Spacing = {
  // Base spacing unit (8px)
  unit: 8,
  
  // Spacing scale
  xs: 4,    // 0.5 * unit
  sm: 8,    // 1 * unit
  md: 16,   // 2 * unit
  lg: 24,   // 3 * unit
  xl: 32,   // 4 * unit
  '2xl': 40, // 5 * unit
  '3xl': 48, // 6 * unit
  '4xl': 64, // 8 * unit
  
  // Component specific spacing
  container: {
    horizontal: 16,
    vertical: 20,
  },
  
  card: {
    padding: 16,
    margin: 4,
    gap: 12,
  },
  
  input: {
    padding: 16,
    margin: 16,
  },
  
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    margin: 8,
  },
  
  section: {
    marginBottom: 24,
  },
  
  // Border radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  }
} as const;

export type SpacingKey = keyof typeof Spacing;