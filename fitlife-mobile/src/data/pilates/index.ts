/**
 * Pilates local data — single import path: `from '../data/pilates'`
 * HTTP/API calls stay in `src/api/pilatesApi.ts`.
 */

export {
  pilatesCatalog,
  pilatesImageAssets,
  getCatalogWorkoutById,
  findCatalogByProgram,
  findCatalogByProgramName,
} from './catalog';

export {
  KEY_PILATES_PROGRAMS,
  KEY_USER_PROGRAMS,
  readCachedPilatesPrograms,
  sortProgramsByDisplayOrder,
} from './cache';

export {
  clearPilatesApiCache,
  reloadPilatesProgramsFromApi,
  ensureDefaultUser,
  enrollUserInProgram,
  getOrCreateAnonymousPilatesDbUserId,
  getProgramById,
  loadPrograms,
  loadUserPrograms,
  loadUsers,
  resolvePilatesApiUserId,
  resolvePilatesBootstrapUser,
  unenrollUserFromProgram,
} from './programs';

export {
  appendCompletion,
  getLastPilatesSyncError,
  loadCompletions,
  saveCompletions,
  type AppendCompletionResult,
} from './progress';

export {
  generateAnalytics,
  getProgressData,
  type AnalyticsPayload,
  type ProgressDataPayload,
  type ProgressPeriod,
} from './analytics';

export {
  appendWeightEntry,
  clearWeightEntries,
  loadWeightEntries,
  saveWeightEntries,
} from './weight';

export {
  ensurePreferencesForLegacyInstall,
  loadUserPreferences,
  saveUserPreferences,
  type UserPreferences,
} from './preferences';

export {
  loadProgramMarkedSlots,
  saveProgramMarkedSlots,
  toggleProgramDaySlot,
} from './schedule';

export {
  loadThemePreference,
  saveThemePreference,
  type ColorSchemePreference,
} from './theme';

export { pickMotivationalMessage } from './messages';
