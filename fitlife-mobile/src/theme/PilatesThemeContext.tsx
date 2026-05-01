import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  saveThemePreference,
  type ColorSchemePreference,
} from '../data/PilatesThemePreferenceRepository';
import {
  darkColors,
  lightColors,
  type AppColors,
} from './PilatesColors';

type ThemeContextValue = {
  colors: AppColors;
  colorScheme: ColorSchemePreference;
  setColorScheme: (scheme: ColorSchemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type Props = {
  children: ReactNode;
  /** Vendoset pas boot-it që të përputhet me ruajtjen lokale. */
  initialScheme?: ColorSchemePreference;
};

export function ThemeProvider({ children, initialScheme = 'light' }: Props) {
  const [colorScheme, setColorSchemeState] =
    useState<ColorSchemePreference>(initialScheme);

  useEffect(() => {
    setColorSchemeState(initialScheme);
  }, [initialScheme]);

  const setColorScheme = useCallback((scheme: ColorSchemePreference) => {
    setColorSchemeState(scheme);
    void saveThemePreference(scheme);
  }, []);

  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  const value = useMemo(
    (): ThemeContextValue => ({
      colors,
      colorScheme,
      setColorScheme,
    }),
    [colors, colorScheme, setColorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

/** Për teste ose përdorim jashtë provider (fallback light). */
export function useThemeOptional(): ThemeContextValue | null {
  return useContext(ThemeContext);
}
