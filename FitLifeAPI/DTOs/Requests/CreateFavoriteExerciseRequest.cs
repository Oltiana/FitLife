namespace FitLifeAPI.DTOs.Requests
{
    public class CreateFavoriteExerciseRequest
    {
        public string ExternalExerciseId { get; set; } = string.Empty;
        public string ExerciseName { get; set; } = string.Empty;
        public string? BodyPart { get; set; }
        public string? TargetMuscle { get; set; }
        public string? Equipment { get; set; }
        public string? GifUrl { get; set; }
    }
}