import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { PilatesStackParamList } from '../../navigation/PilatesNavigationTypes';
import type { AppColors } from '../../theme/PilatesColors';
import { useTheme } from '../../theme/PilatesThemeContext';

type Props = NativeStackScreenProps<PilatesStackParamList, 'BrowseModalityDetail'>;

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 22, paddingBottom: 40 },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      marginBottom: 12,
    },
    badgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
    title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8 },
    meta: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
    body: { fontSize: 15, lineHeight: 22, color: colors.text },
    hint: {
      marginTop: 24,
      fontSize: 13,
      lineHeight: 20,
      color: colors.textSecondary,
    },
  });
}

export function BrowseModalityDetailScreen({ route }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { title, description, minutes, modality } = route.params;
  const tint = modality === 'fitness' ? '#3a9d4d' : '#e4933b';
  const label = modality === 'fitness' ? 'Fitness' : 'Yoga';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={[styles.badge, { backgroundColor: tint }]}>
        <Text style={styles.badgeText}>{label.toUpperCase()}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>About {minutes} minutes · browse-only</Text>
      <Text style={styles.body}>{description}</Text>
      <Text style={styles.hint}>
        Full guided sessions for {label.toLowerCase()} can plug in here later (e.g. video or
        tracked sets). Pilates sessions already open from Search with full timers.
      </Text>
    </ScrollView>
  );
}
