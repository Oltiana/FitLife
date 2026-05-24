using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.DTOs.Responses;
using FitLifeAPI.Models.Entities;

namespace FitLifeAPI.Services.Interfaces
{
    public interface IPilatesService
    {
        Task<IEnumerable<PilatesProgramResponse>> GetAllProgramsAsync(int userId);
        Task<PilatesProgramResponse?> GetProgramByIdAsync(int id, int userId);
        Task<UserPilatesProgressResponse> EnrollAsync(int userId, EnrollPilatesProgramRequest request);
        Task<bool> UnenrollAsync(int userId, int programId);
        Task<IEnumerable<UserPilatesProgressResponse>> GetMyEnrollmentsAsync(int userId);
        Task<UserPilatesProgressResponse?> CompleteWorkoutAsync(int userId, CompletePilatesWorkoutRequest request);
        Task<IReadOnlyList<UserPilatesWorkoutProgressResponse>> GetMyCompletedWorkoutsAsync(int userId);
        Task<PilatesProgramResponse> CreateProgramAsync(CreatePilatesProgramRequest request);
        Task<PilatesWorkoutResponse> CreateWorkoutAsync(CreatePilatesWorkoutRequest request);
        Task<PilatesProgramResponse?> UpdateProgramAsync(int id, UpdatePilatesProgramRequest request);
        Task<bool> DeleteProgramAsync(int id);
        Task<PilatesWorkoutResponse?> UpdateWorkoutAsync(int id, UpdatePilatesWorkoutRequest request);
        Task<bool> DeleteWorkoutAsync(int id);
        Task<PilatesWorkout?> GetWorkoutByIdAsync(int id);
    }
}