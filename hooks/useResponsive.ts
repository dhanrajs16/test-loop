import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface ScreenData {
  width: number;
  height: number;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isTablet: boolean;
  orientation: 'portrait' | 'landscape';
}

export function useResponsive(): ScreenData {
  const [screenData, setScreenData] = useState<ScreenData>(() => {
    const { width, height } = Dimensions.get('window');
    return calculateScreenData(width, height);
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(calculateScreenData(window.width, window.height));
    });

    return () => subscription?.remove();
  }, []);

  return screenData;
}

function calculateScreenData(width: number, height: number): ScreenData {
  const isSmall = width < 768;
  const isMedium = width >= 768 && width < 1024;
  const isLarge = width >= 1024;
  const isTablet = width >= 768;
  const orientation = width > height ? 'landscape' : 'portrait';

  return {
    width,
    height,
    isSmall,
    isMedium,
    isLarge,
    isTablet,
    orientation,
  };
}

// Responsive spacing helper
export function getResponsiveSpacing(base: number, tablet?: number, desktop?: number) {
  const { isSmall, isMedium, isLarge } = useResponsive();
  
  if (isLarge && desktop) return desktop;
  if (isMedium && tablet) return tablet;
  return base;
}

// Responsive font size helper
export function getResponsiveFontSize(base: number, tablet?: number, desktop?: number) {
  const { isSmall, isMedium, isLarge } = useResponsive();
  
  if (isLarge && desktop) return desktop;
  if (isMedium && tablet) return tablet;
  return base;
}