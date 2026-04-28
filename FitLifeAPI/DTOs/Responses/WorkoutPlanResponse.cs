namespace FitLifeAPI.DTOs.Responses
{
    public class WorkoutPlanResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Level { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public List<WorkoutExerciseResponse> Exercises { get; set; } = new();
    }
}