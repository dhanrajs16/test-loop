/**
 * Global Color System
 * Update colors here to change them throughout the app
 */

export const Colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  
  // Secondary Colors
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  
  // Accent Colors
  accent: {
    50: '#fef3c7',
    100: '#fde68a',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  
  // Status Colors
  success: {
    50: '#f0fdf4',
    500: '#10b981',
    600: '#059669',
  },
  
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
  
  // Neutral Colors
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Semantic Colors
  background: '#f9fafb',
  surface: '#ffffff',
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
  },
  
  // Gradients
  gradients: {
    primary: ['#2563eb', '#3b82f6', '#60a5fa'],
    secondary: ['#10b981', '#14b8a6', '#22d3ee'],
    accent: ['#f59e0b', '#f97316'],
    purple: ['#8b5cf6', '#a78bfa'],
  }
} as const;

export type ColorKey = keyof typeof Colors;