import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CalendarStackParamList } from '../../navigation/PilatesNavigationTypes';
import { useTheme } from '../../theme/PilatesThemeContext';

type Props = NativeStackScreenProps<CalendarStackParamList, 'CalendarHub'>;

export function PilatesCalendarHubScreen(_props: Props) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: { flex: 1, backgroundColor: colors.background },
      }),
    [colors.background],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <View style={{ flex: 1 }} />
    </SafeAreaView>
  );
}
