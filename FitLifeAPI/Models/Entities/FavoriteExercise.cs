namespace FitLifeAPI.Models.Entities
{
    public class FavoriteExercise
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string ExternalExerciseId { get; set; } = string.Empty;
        public string ExerciseName { get; set; } = string.Empty;
        public string? BodyPart { get; set; }
        public string? TargetMuscle { get; set; }
        public string? Equipment { get; set; }
        public string? GifUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
    }
}