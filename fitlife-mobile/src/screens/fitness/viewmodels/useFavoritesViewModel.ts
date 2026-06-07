import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    deleteFavoriteExercise,
    getFavoriteExercises,
} from '../../../api/fitnessApi';

export function useFavoritesViewModel() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFavorites = async () => {
        try {
            setLoading(true);

            const data = await getFavoriteExercises();

            setFavorites(data);
        } catch (error) {
            console.log('Failed to load favorites', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            void loadFavorites();
        }, []),
    );

    const handleDeleteFavorite = async (id: number) => {
        try {
            await deleteFavoriteExercise(id);

            setFavorites((prev) =>
                prev.filter((favorite) => favorite.id !== id),
            );
        } catch (error) {
            console.log('Failed to delete favorite', error);
        }
    };

    return {
        favorites,
        loading,
        handleDeleteFavorite,
    };
}