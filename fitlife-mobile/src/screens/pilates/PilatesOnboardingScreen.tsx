import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import type { AppColors } from '../../theme/PilatesColors';
import { useTheme } from '../../theme/PilatesThemeContext';
import { cardShadowThemed } from '../../theme/PilatesShadows';

const W = Dimensions.get('window').width;

type Slide = {
  key: string;
  title: string;
  body: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

const SLIDES: Slide[] = [
  {
    key: '1',
    icon: 'leaf-outline',
    title: 'Welcome to FitLife',
    body: 'Pilates sessions with clear steps, timers, and progress that stays on your device.',
  },
  {
    key: '2',
    icon: 'stats-chart-outline',
    title: 'See your momentum',
    body: 'Track minutes, estimated calories, streaks, and a simple calendar of active days.',
  },
  {
    key: '3',
    icon: 'flag-outline',
    title: 'Set your pace',
    body: 'Optional daily targets help you stay consistent — adjust anytime on the Progress tab.',
  },
];

type Props = {
  onComplete: () => void;
};

function createOnboardingStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    topPad: {
      flex: 1,
    },
    skip: {
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    skipText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    pressed: {
      opacity: 0.7,
    },
    slide: {
      flex: 1,
      paddingHorizontal: 28,
      paddingTop: 24,
      justifyContent: 'flex-start',
    },
    iconWrap: {
      alignSelf: 'center',
      marginBottom: 28,
      padding: 20,
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      ...cardShadowThemed(colors.shadow),
    },
    slideTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 14,
      letterSpacing: -0.5,
      textAlign: 'center',
    },
    slideBody: {
      fontSize: 17,
      lineHeight: 26,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    footer: {
      paddingHorizontal: 24,
      paddingBottom: 24,
      paddingTop: 8,
      gap: 20,
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    dotOn: {
      backgroundColor: colors.primary,
      width: 22,
    },
    cta: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: 'center',
      ...cardShadowThemed(colors.shadow),
    },
    ctaPressed: {
      opacity: 0.92,
    },
    ctaText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '800',
    },
  });
}

export function OnboardingScreen({ onComplete }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createOnboardingStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Slide>>(null);
  const [page, setPage] = useState(0);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      setPage(Math.round(x / Math.max(W, 1)));
    },
    [],
  );

  const goNext = () => {
    if (page >= SLIDES.length - 1) {
      onComplete();
      return;
    }
    listRef.current?.scrollToIndex({
      index: page + 1,
      animated: true,
    });
  };

  const renderItem: ListRenderItem<Slide> = useCallback(
    ({ item }) => {
      return (
        <View style={[styles.slide, { width: W }]}>
          <View style={styles.iconWrap}>
            <Ionicons name={item.icon} size={56} color={colors.primary} />
          </View>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideBody}>{item.body}</Text>
        </View>
      );
    },
    [colors.primary, styles],
  );

  const last = page === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 8) }]}>
        <View style={styles.topPad} />
        <Pressable
          onPress={onComplete}
          style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
          hitSlop={12}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, index) => ({
          length: W,
          offset: W * index,
          index,
        })}
        onScrollToIndexFailed={({ index }) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({ index, animated: true });
          }, 400);
        }}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View
              key={s.key}
              style={[styles.dot, i === page && styles.dotOn]}
            />
          ))}
        </View>
        <Pressable
          onPress={goNext}
          style={({ pressed }) => [
            styles.cta,
            pressed && styles.ctaPressed,
          ]}
        >
          <Text style={styles.ctaText}>{last ? 'Get started' : 'Next'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
