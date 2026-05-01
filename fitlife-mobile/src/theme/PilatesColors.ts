export type AppColors = {
  background: string;
  surface: string;
  primary: string;
  primaryMuted: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  danger: string;
  chartLine: string;
  chartBar: string;
  caloriesLine: string;
  caloriesBar: string;
  /** Gradient middle stop for ImageBanner fadeToSurface */
  imageFadeMid: string;
  shadow: string;
};

export const lightColors: AppColors = {
  background: '#FFF5F8',
  surface: '#FFFFFF',
  primary: '#EC4899',
  primaryMuted: '#F472B6',
  text: '#2A0A19',
  textSecondary: '#6B2142',
  border: '#FBCFE8',
  accent: '#FDA4AF',
  danger: '#C1121F',
  chartLine: '#DB2777',
  chartBar: '#FB7185',
  caloriesLine: '#BE185D',
  caloriesBar: '#FDBA74',
  imageFadeMid: 'rgba(255, 245, 248, 0.78)',
  shadow: '#2A0A19',
};

export const darkColors: AppColors = {
  background: '#0D1612',
  surface: '#15231C',
  primary: '#52B788',
  primaryMuted: '#74C69D',
  text: '#E8F0EC',
  textSecondary: '#9AB0A6',
  border: '#243D32',
  accent: '#40916C',
  danger: '#FF6B6B',
  chartLine: '#74C69D',
  chartBar: '#40916C',
  caloriesLine: '#E9C46A',
  caloriesBar: '#F4A261',
  imageFadeMid: 'rgba(13, 22, 18, 0.82)',
  shadow: '#000000',
};

/** @deprecated Përdor `useTheme().colors` */
export const colors = lightColors;
