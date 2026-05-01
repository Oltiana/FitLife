import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/PilatesThemeContext';
import { cardShadowThemed } from '../theme/PilatesShadows';

function SkeletonCard() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          borderRadius: 24,
          overflow: 'hidden',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          ...cardShadowThemed(colors.shadow),
        },
        banner: {
          width: '100%',
          aspectRatio: 0.68,
          backgroundColor: colors.border,
          opacity: 0.65,
        },
        footer: {
          padding: 16,
          paddingTop: 14,
        },
        lineLg: {
          height: 20,
          width: '72%',
          borderRadius: 8,
          backgroundColor: colors.border,
          opacity: 0.9,
        },
        meta: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 12,
        },
        pill: {
          height: 28,
          width: 88,
          borderRadius: 999,
          backgroundColor: colors.border,
          opacity: 0.8,
        },
        pillSm: {
          width: 64,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.card}>
      <View style={styles.banner} />
      <View style={styles.footer}>
        <View style={styles.lineLg} />
        <View style={styles.meta}>
          <View style={styles.pill} />
          <View style={[styles.pill, styles.pillSm]} />
        </View>
      </View>
    </View>
  );
}

export function PilatesListSkeleton() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 12,
        },
        title: {
          height: 36,
          width: '55%',
          borderRadius: 10,
          backgroundColor: colors.border,
          opacity: 0.7,
        },
        sub: {
          marginTop: 10,
          height: 16,
          width: '80%',
          borderRadius: 8,
          backgroundColor: colors.border,
          opacity: 0.55,
        },
        list: {
          paddingHorizontal: 16,
          paddingBottom: 32,
          gap: 20,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.title} />
        <View style={styles.sub} />
      </View>
      <View style={styles.list}>
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </View>
    </View>
  );
}
