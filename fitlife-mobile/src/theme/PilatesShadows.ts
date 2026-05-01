import { Platform, type ViewStyle } from 'react-native';

/** Soft card shadow (iOS + Android). */
export const cardShadow: ViewStyle =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#2A0A19',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      }
    : { elevation: 6 };

export function cardShadowThemed(shadowColor: string): ViewStyle {
  return Platform.OS === 'ios'
    ? {
        shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 16,
      }
    : { elevation: 6 };
}
