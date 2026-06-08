namespace FitLifeAPI.DTOs.Responses
{
    public class FitnessExerciseResponse
    {
        public int Id { get; set; }

        public string ExerciseName { get; set; } = string.Empty;

        public string? BodyPart { get; set; }

        public string? TargetMuscle { get; set; }

        public string? Equipment { get; set; }

        public string Level { get; set; } = "Beginner";

        public string? GifUrl { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}