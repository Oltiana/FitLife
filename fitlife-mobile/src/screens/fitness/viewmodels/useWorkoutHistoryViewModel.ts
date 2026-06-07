import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getWorkoutSessions } from '../../../api/fitnessApi';

export function useWorkoutHistoryViewModel() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadSessions = async () => {
        try {
            setLoading(true);

            const data = await getWorkoutSessions();

            const completedSessions = data.filter(
                (session: any) => session.completedAt,
            );

            setSessions(completedSessions);
        } catch (error) {
            console.log('Failed to load workout sessions', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            void loadSessions();
        }, []),
    );

    return {
        sessions,
        loading,
    };
}