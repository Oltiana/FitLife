import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { localExercises } from '../../../data/fitness/localExercises';
import {
  addFavoriteExercise,
  deleteFavoriteExercise,
  getExercises,
  getFavoriteExercises,
} from '../../../api/fitnessApi';

export const categories = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Waist'];
export const levels = ['Beginner', 'Intermediate'] as const;

export function useExerciseListViewModel() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] =
    useState<'Beginner' | 'Intermediate'>('Intermediate');
  const [favorites, setFavorites] = useState<any[]>([]);

  const favoriteIds = useMemo(
    () => favorites.map((favorite) => favorite.externalExerciseId),
    [favorites],
  );

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError('');

      const page1 = await getExercises(0, 10);
      const page2 = await getExercises(10, 10);
      const page3 = await getExercises(20, 10);
      const page4 = await getExercises(30, 10);
      const page5 = await getExercises(40, 10);

      setExercises([...page1, ...page2, ...page3, ...page4, ...page5]);
    } catch {
      setExercises(localExercises);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const data = await getFavoriteExercises();
      setFavorites(data);
    } catch {
      console.log('Failed to load favorites');
    }
  };

  useEffect(() => {
    void loadExercises();
    void loadFavorites();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadFavorites();
    }, []),
  );

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const exerciseName = exercise.exerciseName || exercise.name || '';
      const bodyPart = exercise.bodyPart?.toLowerCase() ?? '';
      const targetMuscle = exercise.targetMuscle || exercise.target || '';
      const level = exercise.level?.toLowerCase();

      const matchesLevel = !level || level === selectedLevel.toLowerCase();

      const matchesSearch =
        exerciseName.toLowerCase().includes(searchText.toLowerCase()) ||
        bodyPart.includes(searchText.toLowerCase()) ||
        targetMuscle.toLowerCase().includes(searchText.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        bodyPart.includes(selectedCategory.toLowerCase()) ||
        targetMuscle.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [exercises, searchText, selectedCategory, selectedLevel]);

  const handleToggleFavorite = async (exercise: any) => {
    const exerciseId = exercise.externalExerciseId ?? exercise.id?.toString();
    const existingFavorite = favorites.find(
      (favorite) => favorite.externalExerciseId === exerciseId,
    );

    try {
      if (existingFavorite) {
        await deleteFavoriteExercise(existingFavorite.id);
        setFavorites((prev) =>
          prev.filter((favorite) => favorite.externalExerciseId !== exerciseId),
        );
        return;
      }

      const newFavorite = await addFavoriteExercise({
        externalExerciseId: exerciseId,
        exerciseName: exercise.exerciseName || exercise.name,
        bodyPart: exercise.bodyPart,
        targetMuscle: exercise.targetMuscle || exercise.target,
        equipment: exercise.equipment,
        gifUrl: exercise.gifUrl ?? null,
      });

      setFavorites((prev) => [...prev, newFavorite]);
    } catch {
      Alert.alert('Error', 'Could not update favorite.');
    }
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedCategory('All');
    setSelectedLevel('Intermediate');
  };

  return {
    loading,
    error,
    searchText,
    setSearchText,
    selectedCategory,
    setSelectedCategory,
    selectedLevel,
    setSelectedLevel,
    favorites,
    favoriteIds,
    filteredExercises,
    loadExercises,
    handleToggleFavorite,
    clearFilters,
  };
}