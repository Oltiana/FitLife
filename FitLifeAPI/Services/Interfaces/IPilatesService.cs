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
        Task<IEnumerable<UserPilatesProgressResponse>> GetMyEnrollmentsAsync(int userId);
        Task<UserPilatesProgressResponse?> CompleteWorkoutAsync(int userId, CompletePilatesWorkoutRequest request);
        Task<PilatesProgramResponse> CreateProgramAsync(CreatePilatesProgramRequest request);
        Task<PilatesWorkoutResponse> CreateWorkoutAsync(CreatePilatesWorkoutRequest request);
        Task<PilatesWorkout?> GetWorkoutByIdAsync(int id);
    }
}