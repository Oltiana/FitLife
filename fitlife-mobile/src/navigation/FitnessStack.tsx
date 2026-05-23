import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExerciseListScreen } from '../screens/fitness/ExerciseListScreen';
import { ExerciseDetailScreen } from '../screens/fitness/ExerciseDetailScreen';
import { WorkoutPlansScreen } from '../screens/fitness/WorkoutPlansScreen';
import { WorkoutSessionScreen } from '../screens/fitness/WorkoutSessionScreen';
import { FavoritesScreen } from '../screens/fitness/FavoritesScreen';
import { CreateWorkoutPlanScreen } from '../screens/fitness/CreateWorkoutPlanScreen';
import { WorkoutHistoryScreen } from '../screens/fitness/WorkoutHistoryScreen';

export type FitnessStackParamList = {
    ExerciseList: undefined;
    ExerciseDetails: { exercise: any };
    WorkoutPlans: undefined;
    CreateWorkoutPlan: undefined;
    WorkoutSession: { workoutPlanId: number };
    WorkoutHistory: undefined;
    Favorites: undefined;
};

const Stack = createNativeStackNavigator<FitnessStackParamList>();

export function FitnessStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ExerciseList" component={ExerciseListScreen} />
            <Stack.Screen name="ExerciseDetails" component={ExerciseDetailScreen} />
            <Stack.Screen name="WorkoutPlans" component={WorkoutPlansScreen} />
            <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="CreateWorkoutPlan" component={CreateWorkoutPlanScreen} />
            <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
        </Stack.Navigator>
    );
}