namespace FitLifeAPI.DTOs.Responses
{
    public class PilatesProgramResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationWeeks { get; set; }
        public string Level { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public List<PilatesWorkoutResponse> Workouts { get; set; } = new();
    }

    public class PilatesWorkoutResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public int OrderIndex { get; set; }
        public bool IsCompleted { get; set; }
    }
}