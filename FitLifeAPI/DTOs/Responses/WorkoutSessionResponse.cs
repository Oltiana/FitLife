namespace FitLifeAPI.DTOs.Responses
{
    public class WorkoutSessionResponse
    {
        public int Id { get; set; }
        public int WorkoutPlanId { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? DurationMinutes { get; set; }
        public int? Calories { get; set; }
        public bool Completed { get; set; }
    }
}