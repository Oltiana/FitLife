using FitLifeAPI.Models.Entities;

namespace FitLifeAPI.Repositories.Interfaces
{
    public interface IFitnessRepository
    {
        Task<IEnumerable<FavoriteExercise>> GetFavoriteExercisesAsync(int userId);
        Task<FavoriteExercise?> GetFavoriteExerciseByIdAsync(int id, int userId);
        Task AddFavoriteExerciseAsync(FavoriteExercise favoriteExercise);
        Task DeleteFavoriteExerciseAsync(FavoriteExercise favoriteExercise);

        Task<IEnumerable<WorkoutPlan>> GetWorkoutPlansAsync(int userId);
        Task<WorkoutPlan?> GetWorkoutPlanByIdAsync(int id, int userId);
        Task AddWorkoutPlanAsync(WorkoutPlan workoutPlan);
        Task UpdateWorkoutPlanAsync(WorkoutPlan workoutPlan);
        Task DeleteWorkoutPlanAsync(WorkoutPlan workoutPlan);

        Task AddWorkoutExerciseAsync(WorkoutExercise workoutExercise);
        Task<WorkoutExercise?> GetWorkoutExerciseByIdAsync(int id);
        Task DeleteWorkoutExerciseAsync(WorkoutExercise workoutExercise);

        Task<IEnumerable<WorkoutSession>> GetWorkoutSessionsAsync(int userId);
        Task<WorkoutSession?> GetWorkoutSessionByIdAsync(int id, int userId);
        Task AddWorkoutSessionAsync(WorkoutSession workoutSession);
        Task UpdateWorkoutSessionAsync(WorkoutSession workoutSession);
    }
}