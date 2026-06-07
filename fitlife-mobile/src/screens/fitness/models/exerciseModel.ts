export type Exercise = {
  id: string;
  name: string;
  bodyPart?: string;
  target?: string;
  targetMuscle?: string;
  equipment?: string;
  gifUrl?: string | null;
  level?: 'Beginner' | 'Intermediate';
};