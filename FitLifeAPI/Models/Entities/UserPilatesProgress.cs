namespace FitLifeAPI.Models.Entities
{
    public class UserPilatesProgress
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int PilatesWorkoutId { get; set; }
        public bool IsCompleted { get; set; } = false;
        public DateTime? CompletedAt { get; set; }

        public User User { get; set; } = null!;
        public PilatesWorkout Workout { get; set; } = null!;
    }
}