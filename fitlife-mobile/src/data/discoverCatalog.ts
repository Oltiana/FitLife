/** Katalog demo për Fitness / Yoga — kërkohet në Discover; lidh me API më vonë. */
export type DiscoverModality = 'pilates' | 'fitness' | 'yoga';

export type DiscoverCatalogItem = {
  id: string;
  modality: Exclude<DiscoverModality, 'pilates'>;
  title: string;
  description: string;
  minutes: number;
  /** Fjalë për kërkim */
  tags: string[];
};

export const FITNESS_CATALOG: DiscoverCatalogItem[] = [
  {
    id: 'fx-hiit-core',
    modality: 'fitness',
    title: 'HIIT core blast',
    description: 'Intervals for core and conditioning.',
    minutes: 25,
    tags: ['hiit', 'core', 'cardio', 'strength', 'burn'],
  },
  {
    id: 'fx-upper-push',
    modality: 'fitness',
    title: 'Upper body push',
    description: 'Chest, shoulders, triceps — moderate load.',
    minutes: 35,
    tags: ['upper', 'push', 'strength', 'chest', 'arms'],
  },
  {
    id: 'fx-leg-day',
    modality: 'fitness',
    title: 'Leg day basics',
    description: 'Squat patterns, hinges, and calves.',
    minutes: 40,
    tags: ['legs', 'squat', 'glutes', 'strength', 'lower'],
  },
  {
    id: 'fx-full-strength',
    modality: 'fitness',
    title: 'Full body strength',
    description: 'Compound lifts in simple supersets.',
    minutes: 45,
    tags: ['full body', 'strength', 'barbell', 'compound'],
  },
  {
    id: 'fx-mobility-reset',
    modality: 'fitness',
    title: 'Mobility reset',
    description: 'Hips, T-spine, shoulders — prehab style.',
    minutes: 20,
    tags: ['mobility', 'stretch', 'hips', 'recovery'],
  },
];

export const YOGA_CATALOG: DiscoverCatalogItem[] = [
  {
    id: 'yg-sun-flow',
    modality: 'yoga',
    title: 'Sun salutation flow',
    description: 'Classic A/B variations at an easy pace.',
    minutes: 30,
    tags: ['vinyasa', 'flow', 'sun', 'breath', 'warm'],
  },
  {
    id: 'yg-hips-slow',
    modality: 'yoga',
    title: 'Slow hips & hamstrings',
    description: 'Long holds for flexibility.',
    minutes: 35,
    tags: ['yin', 'hips', 'hamstrings', 'stretch', 'relax'],
  },
  {
    id: 'yg-balance-stand',
    modality: 'yoga',
    title: 'Balance & standing poses',
    description: 'Tree, warrior III, transitions.',
    minutes: 28,
    tags: ['balance', 'standing', 'focus', 'legs'],
  },
  {
    id: 'yg-wind-down',
    modality: 'yoga',
    title: 'Evening wind-down',
    description: 'Gentle floor sequence before sleep.',
    minutes: 22,
    tags: ['restorative', 'evening', 'calm', 'sleep'],
  },
  {
    id: 'yg-power-vinyasa',
    modality: 'yoga',
    title: 'Power vinyasa',
    description: 'Faster rhythm, strength-oriented flow.',
    minutes: 40,
    tags: ['power', 'vinyasa', 'cardio', 'strength'],
  },
];
