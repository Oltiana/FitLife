import { useState } from 'react';
import { Alert } from 'react-native';
import { createWorkoutPlan } from '../../../api/fitnessApi';

export function useCreateWorkoutPlanViewModel(onSuccess: () => void) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [level, setLevel] = useState<'Beginner' | 'Intermediate'>('Beginner');
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Validation', 'Please enter workout plan name.');
            return;
        }

        try {
            setSaving(true);
            await createWorkoutPlan({ name, description, level });
            onSuccess();
        } catch (error) {
            Alert.alert('Error', 'Could not create workout plan.');
        } finally {
            setSaving(false);
        }
    };

    return {
        name,
        setName,
        description,
        setDescription,
        level,
        setLevel,
        saving,
        handleCreate,
    };
}