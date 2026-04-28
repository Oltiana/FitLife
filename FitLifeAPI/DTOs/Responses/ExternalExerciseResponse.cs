using System.Text.Json.Serialization;

namespace FitLifeAPI.DTOs.Responses
{
    public class ExternalExerciseResponse
    {
        [JsonPropertyName("id")]
        public string ExternalExerciseId { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string ExerciseName { get; set; } = string.Empty;

        [JsonPropertyName("bodyPart")]
        public string? BodyPart { get; set; }

        [JsonPropertyName("target")]
        public string? TargetMuscle { get; set; }

        [JsonPropertyName("equipment")]
        public string? Equipment { get; set; }

        [JsonPropertyName("gifUrl")]
        public string? GifUrl { get; set; }
    }
}