using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.DTOs.Responses;

namespace FitLifeAPI.Services.Interfaces
{
    public interface IFitnessService
    {
        Task<IEnumerable<FavoriteExerciseResponse>> GetFavoriteExercisesAsync(int userId);
        Task<FavoriteExerciseResponse> AddFavoriteExerciseAsync(int userId, CreateFavoriteExerciseRequest request);
        Task<bool> DeleteFavoriteExerciseAsync(int id, int userId);

        Task<IEnumerable<WorkoutPlanResponse>> GetWorkoutPlansAsync(int userId);
        Task<WorkoutPlanResponse> CreateWorkoutPlanAsync(int userId, CreateWorkoutPlanRequest request);
        Task<WorkoutPlanResponse?> GetWorkoutPlanByIdAsync(int id, int userId);
        Task<bool> DeleteWorkoutPlanAsync(int id, int userId);

        Task<WorkoutExerciseResponse> AddWorkoutExerciseAsync(int workoutPlanId, int userId, AddWorkoutExerciseRequest request);
        Task<bool> DeleteWorkoutExerciseAsync(int id, int userId);

        Task<IEnumerable<WorkoutSessionResponse>> GetWorkoutSessionsAsync(int userId);
        Task<WorkoutSessionResponse> StartWorkoutSessionAsync(int userId, CreateWorkoutSessionRequest request);
        Task<WorkoutSessionResponse?> CompleteWorkoutSessionAsync(int id, int userId, CompleteWorkoutSessionRequest request);
    }
}