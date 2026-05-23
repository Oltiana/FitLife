namespace FitLifeAPI.DTOs.Responses
{
    public class UserPilatesWorkoutProgressResponse
    {
        public int Id { get; set; }
        public int PilatesWorkoutId { get; set; }
        public int PilatesProgramId { get; set; }
        public string WorkoutName { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int DurationMinutes { get; set; }
    }
}
