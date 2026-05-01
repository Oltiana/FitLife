namespace FitLife.Api.Models;

public class PilatesWorkoutCompletionEntity
{
    public string Id { get; set; } = string.Empty;
    public string WorkoutId { get; set; } = string.Empty;
    public string WorkoutTitle { get; set; } = string.Empty;
    public DateTime CompletedAt { get; set; }
    public int DurationMinutes { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int? CaloriesBurned { get; set; }
}
