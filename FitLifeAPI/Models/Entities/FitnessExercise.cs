namespace FitLifeAPI.Models.Entities
{
    public class FitnessExercise
    {
        public int Id { get; set; }

        public string ExerciseName { get; set; } = string.Empty;

        public string? BodyPart { get; set; }

        public string? TargetMuscle { get; set; }

        public string? Equipment { get; set; }

        public string Level { get; set; } = "Beginner";

        public string? GifUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}