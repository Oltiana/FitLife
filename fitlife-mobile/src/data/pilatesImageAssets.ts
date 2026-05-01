import type { ImageSourcePropType } from 'react-native';

/**
 * Pilates photos live under `images/pilates-images/` (shared `images/` tree).
 * Other modules may use e.g. `images/other/` or their own folders.
 * Indices P[0]…P[10] map to usage order in `pilatesCatalog`.
 */
export const pilatesImageAssets: ImageSourcePropType[] = [
  require('../../images/pilates-images/1dd9cb26fd86fff0f8bc38878c2bb92f.jpg'),
  require('../../images/pilates-images/2aa35f5ad90464621f3fd3218d9662b9.jpg'),
  require('../../images/pilates-images/42d9c8f71abf07551738af9d44b2dad6.jpg'),
  require('../../images/pilates-images/64d20176202d15d25f3df24f8e1dd86d.jpg'),
  require('../../images/pilates-images/91f99bbe3c52ea68e56865489edc7576.jpg'),
  require('../../images/pilates-images/9d8c9ec1615cff110e566fbbbd6c9e5c.jpg'),
  require('../../images/pilates-images/9d8fa8f3a43fcd83863207db37738263.jpg'),
  require('../../images/pilates-images/a0423fc50164c4af8913dac8d915d7cd.jpg'),
  require('../../images/pilates-images/a6ac00cd6c2d066e85390903007d49b4.jpg'),
  require('../../images/pilates-images/b863db576f964f80f636536ae8db1e9c.jpg'),
  require('../../images/pilates-images/dc1c685edbed1dc99b336ee542ba6013.jpg'),
];
