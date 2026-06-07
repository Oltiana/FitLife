import { useCallback, useEffect, useState } from 'react';
import {
  deleteAdminFitnessWorkoutPlan,
  getAdminFitnessWorkoutPlans,
  updateAdminFitnessWorkoutPlan,
  type AdminFitnessWorkoutPlan,
} from '../../../api/adminFitnessApi';

export function useAdminFitnessViewModel() {
  const [plans, setPlans] = useState<AdminFitnessWorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getAdminFitnessWorkoutPlans();
      setPlans(data);
    } catch (error) {
      console.warn('Failed to load fitness plans', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const handleDeletePlan = async (id: number) => {
    await deleteAdminFitnessWorkoutPlan(id);
    await loadPlans();
  };

  const handleUpdatePlan = async (
    id: number,
    data: {
      name: string;
      description: string;
      level: string;
    }
  ) => {
    await updateAdminFitnessWorkoutPlan(id, data);
    await loadPlans();
  };

  return {
    plans,
    loading,
    loadPlans,
    handleDeletePlan,
    handleUpdatePlan,
  };
}