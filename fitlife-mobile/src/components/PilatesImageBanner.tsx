import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { type ImageSourcePropType, StyleSheet, View, type ViewStyle } from 'react-native';
import { WorkoutImage } from './PilatesWorkoutImage';
import type { ImageCropPosition } from '../domain/PilatesDomainTypes';
import { useTheme } from '../theme/PilatesThemeContext';
import { cardShadow } from '../theme/PilatesShadows';

type Props = {
  source: ImageSourcePropType;
  height?: number;
  aspectRatio?: number;
  flex?: number;
  minHeight?: number;
  variant?: 'darkBottom' | 'fadeToSurface';
  children?: ReactNode;
  style?: ViewStyle;
  bottomInset?: number;
  /** Crop anchor for hero images when using `cover`. */
  imageCropPosition?: ImageCropPosition;
  /** `contain` fits the full image in frame (letterboxing if needed). */
  imageResizeMode?: 'cover' | 'contain';
};

export function ImageBanner({
  source,
  height,
  aspectRatio,
  flex,
  minHeight,
  variant = 'darkBottom',
  children,
  style,
  bottomInset = 0,
  imageCropPosition = 'center',
  imageResizeMode = 'cover',
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          overflow: 'hidden',
        },
        backdrop: {
          backgroundColor: colors.background,
        },
        gradientBottom: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '58%',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        },
        foreground: {
          ...StyleSheet.absoluteFillObject,
          justifyContent: 'flex-end',
          padding: 16,
        },
      }),
    [colors],
  );

  const sizeStyle =
    flex != null
      ? { flex, minHeight: minHeight ?? 260, width: '100%' as const }
      : aspectRatio != null
        ? { width: '100%' as const, aspectRatio }
        : { height: height ?? 200, width: '100%' as const };

  return (
    <View
      style={[
        styles.wrap,
        styles.backdrop,
        sizeStyle,
        { borderRadius: 24 },
        cardShadow,
        style,
      ]}
    >
      <WorkoutImage
        source={source}
        resizeMode={imageResizeMode}
        cropPosition={imageResizeMode === 'contain' ? 'center' : imageCropPosition}
        style={[StyleSheet.absoluteFill, styles.backdrop]}
      />
      {variant === 'darkBottom' ? (
        <View style={styles.gradientBottom} pointerEvents="none">
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(8, 32, 24, 0.92)']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>
      ) : (
        <View style={styles.gradientBottom} pointerEvents="none">
          <LinearGradient
            colors={['transparent', colors.imageFadeMid, colors.surface]}
            locations={[0.2, 0.75, 1]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>
      )}
      {children != null ? (
        <View style={[styles.foreground, { paddingBottom: bottomInset }]}>
          {children}
        </View>
      ) : null}
    </View>
  );
}
