/**
 * Global Typography System
 * Update fonts and text styles here to change them throughout the app
 */

export const Typography = {
  // Font Families
  fonts: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  
  // Font Sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },
  
  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Text Styles
  styles: {
    // Headings
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      lineHeight: 38,
    },
    h2: {
      fontSize: 28,
      fontWeight: 'bold' as const,
      lineHeight: 34,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 30,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 26,
    },
    
    // Body Text
    body: {
      fontSize: 16,
      fontWeight: 'normal' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: 'normal' as const,
      lineHeight: 20,
    },
    
    // UI Text
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal' as const,
      lineHeight: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 18,
    },
  }
} as const;

export type TypographyStyle = keyof typeof Typography.styles;