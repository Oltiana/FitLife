namespace FitLifeAPI.DTOs.Requests
{
    public class CompleteWorkoutSessionRequest
    {
        public int? DurationMinutes { get; set; }
        public int? Calories { get; set; }
    }
}