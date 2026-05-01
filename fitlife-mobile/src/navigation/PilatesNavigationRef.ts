import { createNavigationContainerRef } from '@react-navigation/native';
import type { MainTabParamList } from './PilatesNavigationTypes';

/** Referencë globale për nisje sesioni jashtë komponentëve (API `startPilatesSession`). */
export const navigationRef = createNavigationContainerRef<MainTabParamList>();
