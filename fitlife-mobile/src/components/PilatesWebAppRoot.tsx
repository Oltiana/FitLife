import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/PilatesThemeContext';

const MAX_CONTENT_WIDTH = 720;

type Props = {
  children: ReactNode;
};

/**
 * Web: one column with max width. Avoid nested flex:1 chains that collapse to 0 height.
 */
export function WebAppRoot({ children }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        webRoot: {
          flex: 1,
          width: '100%',
          minHeight: '100%',
          backgroundColor: colors.background,
        },
        webInner: {
          flex: 1,
          width: '100%',
          maxWidth: MAX_CONTENT_WIDTH,
          minHeight: '100%',
          alignSelf: 'center',
          backgroundColor: colors.background,
        },
      }),
    [colors],
  );

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.webRoot}>
      <View style={styles.webInner}>{children}</View>
    </View>
  );
}
