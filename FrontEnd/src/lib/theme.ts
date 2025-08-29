
// Theme configuration for accessibility and consistent colors
export const themeConfig = {
  colors: {
    // Brand colors - HSL format for better theme support
    brand: {
      blue: 'hsl(222 76% 55%)',
      purple: 'hsl(250 81% 73%)',
      accent: 'hsl(184 100% 53%)',
    },
    
    // Semantic colors for different states
    semantic: {
      success: 'hsl(142 71% 45%)',
      warning: 'hsl(38 92% 50%)',
      error: 'hsl(0 84% 60%)',
      info: 'hsl(217 91% 60%)',
    },
    
    // Status colors
    status: {
      online: 'hsl(142 71% 45%)',
      away: 'hsl(38 92% 50%)',
      busy: 'hsl(0 84% 60%)',
      offline: 'hsl(215 20% 65%)',
    }
  },
  
  // Accessibility contrast ratios (WCAG AA compliant)
  accessibility: {
    minContrast: 4.5, // For normal text
    minContrastLarge: 3.0, // For large text (18pt+ or 14pt+ bold)
  },
  
  // Dark mode overrides
  darkMode: {
    background: 'hsl(224 71% 4%)',
    foreground: 'hsl(210 40% 98%)',
    muted: 'hsl(217 32% 17%)',
    mutedForeground: 'hsl(215 20% 65%)',
    border: 'hsl(217 32% 17%)',
  }
};

export const getContrastColor = (isDark: boolean, variant: 'primary' | 'secondary' | 'muted' = 'primary') => {
  if (isDark) {
    switch (variant) {
      case 'primary':
        return themeConfig.darkMode.foreground;
      case 'secondary':
        return themeConfig.darkMode.mutedForeground;
      case 'muted':
        return themeConfig.darkMode.muted;
      default:
        return themeConfig.darkMode.foreground;
    }
  }
  
  // Light mode defaults from CSS variables
  switch (variant) {
    case 'primary':
      return 'hsl(222 47% 11.2%)';
    case 'secondary':
      return 'hsl(215.4 16.3% 46.9%)';
    case 'muted':
      return 'hsl(210 40% 96.1%)';
    default:
      return 'hsl(222 47% 11.2%)';
  }
};
