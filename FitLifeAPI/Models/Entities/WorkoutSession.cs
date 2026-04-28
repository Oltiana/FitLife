namespace FitLifeAPI.Models.Entities
{
    public class WorkoutSession
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public int WorkoutPlanId { get; set; }

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        public int? DurationMinutes { get; set; }
        public int? Calories { get; set; }
        public bool Completed { get; set; } = false;

        public User User { get; set; } = null!;
        public WorkoutPlan WorkoutPlan { get; set; } = null!;
    }
}