import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
    addExerciseToWorkoutPlan,
    addFavoriteExercise,
    getWorkoutPlans,
} from '../../../api/fitnessApi';

export function useExerciseDetailViewModel(
    exercise: any,
    navigation: any,
) {
    const [plans, setPlans] = useState<any[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [sets, setSets] = useState('3');
    const [reps, setReps] = useState('10');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [favoriteMessage, setFavoriteMessage] = useState('');

    const exerciseName = exercise?.exerciseName || exercise?.name;
    const targetMuscle = exercise?.targetMuscle || exercise?.target;
    const exerciseId = exercise?.externalExerciseId || exercise?.id;

    const loadPlans = async () => {
        try {
            const data = await getWorkoutPlans();
            setPlans(data);
        } catch (error) {
            console.log('Failed to load workout plans', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            void loadPlans();
        }, []),
    );

    const handleAddToPlan = async () => {
        if (!selectedPlanId) {
            Alert.alert('Select plan', 'Please select a workout plan first.');
            return;
        }

        try {
            setSaving(true);

            await addExerciseToWorkoutPlan(selectedPlanId, {
                externalExerciseId: exerciseId?.toString() ?? '',
                exerciseName: exerciseName ?? 'Exercise',
                bodyPart: exercise?.bodyPart,
                targetMuscle,
                gifUrl: exercise?.gifUrl ?? null,
                sets: Number(sets),
                reps: Number(reps),
                orderIndex: 1,
            });

            setShowModal(false);

            Alert.alert(
                'Exercise added',
                'This exercise was added to your workout plan.',
                [
                    { text: 'Done', style: 'cancel' },
                    {
                        text: 'View Plan',
                        onPress: () => navigation.navigate('WorkoutPlans'),
                    },
                ],
            );
        } catch {
            Alert.alert(
                'Error',
                'Could not add exercise to workout plan.',
            );
        } finally {
            setSaving(false);
        }
    };

    const handleAddFavorite = async () => {
        try {
            await addFavoriteExercise({
                externalExerciseId: exerciseId?.toString() ?? '',
                exerciseName: exerciseName ?? 'Exercise',
                bodyPart: exercise?.bodyPart,
                targetMuscle,
                equipment: exercise?.equipment,
                gifUrl: exercise?.gifUrl ?? null,
            });

            setFavoriteMessage('Exercise added to favorites.');
        } catch {
            setFavoriteMessage(
                'Could not add exercise to favorites.',
            );
        }
    };

    const handleCreateNewPlan = () => {
        setShowModal(false);
        navigation.navigate('CreateWorkoutPlan');
    };
    return {
        exerciseName,
        targetMuscle,
        plans,
        selectedPlanId,
        setSelectedPlanId,
        sets,
        setSets,
        reps,
        setReps,
        showModal,
        setShowModal,
        saving,
        favoriteMessage,
        handleAddToPlan,
        handleAddFavorite,
        handleCreateNewPlan,
    };
}