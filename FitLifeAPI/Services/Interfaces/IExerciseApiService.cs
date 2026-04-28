using FitLifeAPI.DTOs.Responses;

namespace FitLifeAPI.Services.Interfaces
{
    public interface IExerciseApiService
    {
        Task<List<ExternalExerciseResponse>> GetExercisesAsync(int offset = 0, int limit = 10);
        Task<ExternalExerciseResponse?> GetExerciseByIdAsync(string id);
    }
}