namespace FitLifeAPI.DTOs.Requests
{
    public class CreateWorkoutPlanRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Level { get; set; } = string.Empty;
    }
}