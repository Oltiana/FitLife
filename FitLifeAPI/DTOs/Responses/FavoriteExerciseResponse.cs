namespace FitLifeAPI.DTOs.Responses
{
    public class FavoriteExerciseResponse
    {
        public int Id { get; set; }
        public string ExternalExerciseId { get; set; } = string.Empty;
        public string ExerciseName { get; set; } = string.Empty;
        public string? BodyPart { get; set; }
        public string? TargetMuscle { get; set; }
        public string? Equipment { get; set; }
        public string? GifUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}