import { Image } from 'expo-image';
import type { ImageContentPositionString } from 'expo-image';
import {
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
} from 'react-native';
import type { ImageCropPosition } from '../domain/PilatesDomainTypes';

const cropToExpo: Record<ImageCropPosition, ImageContentPositionString> = {
  center: 'center',
  top: 'top center',
  bottom: 'bottom center',
  left: 'left center',
  right: 'right center',
  topLeft: 'top left',
  topRight: 'top right',
  bottomLeft: 'bottom left',
  bottomRight: 'bottom right',
};

type Props = {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  /**
   * `cover` fills the frame; `contain` fits the whole image (letterboxing if needed).
   */
  resizeMode?: 'cover' | 'contain';
  /** Crop anchor when `resizeMode` is `cover`. */
  cropPosition?: ImageCropPosition;
};

export function WorkoutImage({
  source,
  style,
  resizeMode = 'cover',
  cropPosition = 'center',
}: Props) {
  const position: ImageContentPositionString =
    resizeMode === 'contain' ? 'center' : cropToExpo[cropPosition];

  return (
    <Image
      source={source}
      style={style}
      contentFit={resizeMode}
      contentPosition={position}
      transition={200}
    />
  );
}
