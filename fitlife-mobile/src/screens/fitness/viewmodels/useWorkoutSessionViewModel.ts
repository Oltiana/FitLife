import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
    completeWorkoutSession,
    deleteWorkoutExercise,
    getWorkoutPlanById,
    startWorkoutSession,
    updateWorkoutExercise,
} from '../../../api/fitnessApi';

export function useWorkoutSessionViewModel(
    workoutPlanId: number,
    navigation: any,
) {
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
    const [sessionStarted, setSessionStarted] = useState(false);
    const [startedAt, setStartedAt] = useState<Date | null>(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<any>(null);
    const [editSets, setEditSets] = useState('');
    const [editReps, setEditReps] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(84);
    const [isPaused, setIsPaused] = useState(false);
    const [currentSet, setCurrentSet] = useState(1);

    const exercises = plan?.exercises ?? [];
    const currentExercise = exercises[currentExerciseIndex];
    const nextExercise = exercises[currentExerciseIndex + 1];
    const hasExercises = exercises.length > 0;

    const loadPlan = async () => {
        try {
            setLoading(true);
            const data = await getWorkoutPlanById(workoutPlanId);
            setPlan(data);
        } catch (error) {
            console.log('Failed to load workout plan', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadPlan();
    }, []);

    useEffect(() => {
        if (!sessionStarted || isPaused || secondsLeft <= 0) return;

        const interval = setInterval(() => {
            setSecondsLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [sessionStarted, isPaused, secondsLeft]);

    const getProgress = () => {
        if (!exercises.length) return 0;

        const completedBeforeCurrent = currentExerciseIndex;
        const currentExerciseSets = currentExercise?.sets ?? 1;
        const currentSetProgress = (currentSet - 1) / currentExerciseSets;

        return ((completedBeforeCurrent + currentSetProgress) / exercises.length) * 100;
    };

    const progress = getProgress();

    const handleStartWorkout = async () => {
        try {
            const session = await startWorkoutSession(workoutPlanId);

            setActiveSessionId(session.id);
            setSessionStarted(true);
            setStartedAt(new Date());
            setCurrentExerciseIndex(0);
            setSecondsLeft(84);
            setIsPaused(false);
            setCurrentSet(1);
            setStatusMessage('Workout session is now active.');
        } catch {
            setStatusMessage('Could not start workout session.');
        }
    };

    const handleCompleteWorkout = async () => {
        if (!activeSessionId) {
            Alert.alert('Error', 'No active workout session found.');
            return;
        }

        const durationMinutes = startedAt
            ? Math.max(
                1,
                Math.round((new Date().getTime() - startedAt.getTime()) / 60000),
            )
            : 1;

        try {
            await completeWorkoutSession(activeSessionId, {
                durationMinutes,
                calories: 0,
            });

            setStatusMessage(
                `Workout completed successfully. Duration: ${durationMinutes} min.`,
            );
            setSessionStarted(false);
            setActiveSessionId(null);
            setStartedAt(null);

            setTimeout(() => {
                navigation.goBack();
            }, 1200);
        } catch {
            Alert.alert('Error', 'Could not complete workout.');
        }
    };

    const handleNextExercise = () => {
        if (!currentExercise) return;

        const totalSets = currentExercise.sets ?? 1;

        if (currentSet < totalSets) {
            setCurrentSet((prev) => prev + 1);
            setSecondsLeft(84);
            setIsPaused(false);
            return;
        }

        if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex((prev) => prev + 1);
            setCurrentSet(1);
            setSecondsLeft(84);
            setIsPaused(false);
        }
    };

    const handlePreviousExercise = () => {
        if (!currentExercise) return;

        if (currentSet > 1) {
            setCurrentSet((prev) => prev - 1);
            setSecondsLeft(84);
            setIsPaused(false);
            return;
        }

        if (currentExerciseIndex > 0) {
            const previousExercise = exercises[currentExerciseIndex - 1];

            setCurrentExerciseIndex((prev) => prev - 1);
            setCurrentSet(previousExercise?.sets ?? 1);
            setSecondsLeft(84);
            setIsPaused(false);
        }
    };

    const handleSelectSet = (setNumber: number) => {
        setCurrentSet(setNumber);
        setSecondsLeft(84);
        setIsPaused(false);
    };

    const handleRemoveExercise = (exerciseId: number) => {
        Alert.alert(
            'Remove Exercise',
            'Are you sure you want to remove this exercise from the plan?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteWorkoutExercise(exerciseId);
                            await loadPlan();
                            setCurrentExerciseIndex(0);
                            setCurrentSet(1);
                            setStatusMessage('Exercise removed from plan.');
                        } catch {
                            setStatusMessage('Could not remove exercise.');
                        }
                    },
                },
            ],
        );
    };

    const openEditModal = (exercise: any) => {
        setSelectedExercise(exercise);
        setEditSets(exercise.sets?.toString() ?? '1');
        setEditReps(exercise.reps?.toString() ?? '1');
        setEditModalVisible(true);
    };

    const handleUpdateExercise = async () => {
        if (!selectedExercise) return;

        try {
            await updateWorkoutExercise(selectedExercise.id, {
                sets: Number(editSets),
                reps: Number(editReps),
            });

            await loadPlan();
            setEditModalVisible(false);
            setSelectedExercise(null);
            setStatusMessage('Exercise updated successfully.');
        } catch {
            setStatusMessage('Could not update exercise.');
        }
    };

    return {
        plan,
        loading,
        sessionStarted,
        statusMessage,
        currentExerciseIndex,
        editModalVisible,
        setEditModalVisible,
        selectedExercise,
        editSets,
        setEditSets,
        editReps,
        setEditReps,
        secondsLeft,
        isPaused,
        setIsPaused,
        currentSet,
        exercises,
        currentExercise,
        nextExercise,
        hasExercises,
        progress,
        handleStartWorkout,
        handleCompleteWorkout,
        handleNextExercise,
        handlePreviousExercise,
        handleSelectSet,
        handleRemoveExercise,
        openEditModal,
        handleUpdateExercise,
    };
}