import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { deleteWorkoutPlan, getWorkoutPlans } from '../../../api/fitnessApi';

export function useWorkoutPlansViewModel() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const data = await getWorkoutPlans();
            setPlans(data);
        } catch (error) {
            console.log('Failed to load workout plans', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            void loadPlans();
        }, []),
    );

    const handleDeletePlan = (id: number) => {
        Alert.alert(
            'Delete Workout Plan',
            'Are you sure you want to delete this workout plan?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteWorkoutPlan(id);
                            await loadPlans();
                        } catch (error) {
                            console.log('Failed to delete workout plan', error);
                        }
                    },
                },
            ],
        );
    };

    return {
        plans,
        loading,
        loadPlans,
        handleDeletePlan,
    };
}