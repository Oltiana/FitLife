namespace FitLifeAPI.DTOs.Responses
{
    public class WorkoutExerciseResponse
    {
        public int Id { get; set; }
        public string ExternalExerciseId { get; set; } = string.Empty;
        public string ExerciseName { get; set; } = string.Empty;
        public string? BodyPart { get; set; }
        public string? TargetMuscle { get; set; }
        public string? GifUrl { get; set; }

        public int Sets { get; set; }
        public int Reps { get; set; }
        public int OrderIndex { get; set; }
    }
}