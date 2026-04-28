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

        public async Task<List<ExternalExerciseResponse>> GetExercisesAsync(int offset = 0, int limit = 10)
        {
            var response = await _httpClient.GetAsync($"/exercises?offset={offset}&limit={limit}");

            if (!response.IsSuccessStatusCode)
                throw new Exception("Failed to fetch exercises from external API");

            var json = await response.Content.ReadAsStringAsync();

            return JsonSerializer.Deserialize<List<ExternalExerciseResponse>>(
                json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            ) ?? new List<ExternalExerciseResponse>();
        }

        public async Task<ExternalExerciseResponse?> GetExerciseByIdAsync(string id)
        {
            var response = await _httpClient.GetAsync($"/exercises/exercise/{id}");

            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();

            return JsonSerializer.Deserialize<ExternalExerciseResponse>(
                json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );
        }
    }
}