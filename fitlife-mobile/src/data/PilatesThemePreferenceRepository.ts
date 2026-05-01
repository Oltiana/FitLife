import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@fitlife/color_scheme_v1';

export type ColorSchemePreference = 'light' | 'dark';

export async function loadThemePreference(): Promise<ColorSchemePreference> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw === 'dark' || raw === 'light') return raw;
  } catch {
    /* ignore */
  }
  return 'light';
}

export async function saveThemePreference(
  scheme: ColorSchemePreference,
): Promise<void> {
  await AsyncStorage.setItem(KEY, scheme);
}
