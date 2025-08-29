
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { RootState } from '@/store';
import { setTheme } from '@/store/uiSlice';
import { localStorageManager } from '@/lib/localStorage';
import { themeConfig, getContrastColor } from '@/lib/theme';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.ui.theme);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Initialize theme based on system preference and store
  useEffect(() => {
    const applyTheme = (darkMode: boolean) => {
      setIsDarkMode(darkMode);
      if (darkMode) {
        document.documentElement.classList.add('dark');
        // Apply dark mode CSS variables
        document.documentElement.style.setProperty('--background', themeConfig.darkMode.background);
        document.documentElement.style.setProperty('--foreground', themeConfig.darkMode.foreground);
        document.documentElement.style.setProperty('--muted', themeConfig.darkMode.muted);
        document.documentElement.style.setProperty('--muted-foreground', themeConfig.darkMode.mutedForeground);
        document.documentElement.style.setProperty('--border', themeConfig.darkMode.border);
      } else {
        document.documentElement.classList.remove('dark');
        // Reset to light mode (CSS variables are already set in index.css)
        document.documentElement.style.removeProperty('--background');
        document.documentElement.style.removeProperty('--foreground');
        document.documentElement.style.removeProperty('--muted');
        document.documentElement.style.removeProperty('--muted-foreground');
        document.documentElement.style.removeProperty('--border');
      }
    };

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark);
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorageManager.saveTheme(theme);
  }, [theme]);
  
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    dispatch(setTheme(newTheme));
  };
  
  return (
    <button 
      onClick={toggleTheme}
      className={cn(
        "w-12 h-6 rounded-full p-1 transition-all duration-300 relative",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50",
        isDarkMode ? "bg-primary" : "bg-accent"
      )}
      style={{
        backgroundColor: isDarkMode ? themeConfig.colors.brand.purple : themeConfig.colors.brand.blue
      }}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div 
        className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-300 bg-white shadow-sm",
          isDarkMode ? "translate-x-6" : "translate-x-0"
        )}
      >
        {isDarkMode ? (
          <Moon className="w-3 h-3" style={{ color: themeConfig.colors.brand.purple }} />
        ) : (
          <Sun className="w-3 h-3" style={{ color: themeConfig.colors.brand.blue }} />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
