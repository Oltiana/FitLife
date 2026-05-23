using System.Text.Json;
using FitLifeAPI.DTOs.Responses;
using FitLifeAPI.Services.Interfaces;

namespace FitLifeAPI.Services
{
    public class ExerciseApiService : IExerciseApiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public ExerciseApiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        private string GetExerciseLevel(string? bodyPart, string? targetMuscle, string? equipment)
        {
            var equipmentValue = equipment?.ToLower() ?? "";

            if (equipmentValue.Contains("body weight"))
                return "Beginner";

            return "Intermediate";
        }

        public async Task<List<ExternalExerciseResponse>> GetExercisesAsync(int offset = 0, int limit = 10)
        {
            var response = await _httpClient.GetAsync($"/exercises?offset={offset}&limit={limit}&includeGif=true");

            if (!response.IsSuccessStatusCode)
                throw new Exception("Failed to fetch exercises from external API");

            var json = await response.Content.ReadAsStringAsync();

            var exercises = JsonSerializer.Deserialize<List<ExternalExerciseResponse>>(
                json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            ) ?? new List<ExternalExerciseResponse>();

            foreach (var exercise in exercises)
            {
                exercise.Level = GetExerciseLevel(exercise.BodyPart, exercise.TargetMuscle, exercise.Equipment);
            }

            return exercises;
        }
        public async Task<ExternalExerciseResponse?> GetExerciseByIdAsync(string id)
        {
            var response = await _httpClient.GetAsync($"/exercises/exercise/{id}?includeGif=true");

            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();

            var exercise = JsonSerializer.Deserialize<ExternalExerciseResponse>(
                json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

            if (exercise != null)
            {
                exercise.Level = GetExerciseLevel(
                    exercise.BodyPart,
                    exercise.TargetMuscle,
                    exercise.Equipment
                );
            }

            return exercise;
        }
    }
}