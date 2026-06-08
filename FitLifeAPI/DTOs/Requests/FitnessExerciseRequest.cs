using System.ComponentModel.DataAnnotations;

namespace FitLifeAPI.DTOs.Requests
{
    public class FitnessExerciseRequest
    {
        [Required]
        public string ExerciseName { get; set; } = string.Empty;

        public string? BodyPart { get; set; }

        public string? TargetMuscle { get; set; }

        public string? Equipment { get; set; }

        public string Level { get; set; } = "Beginner";

        public string? GifUrl { get; set; }
    }
}