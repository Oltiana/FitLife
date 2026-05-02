namespace FitLifeAPI.DTOs.Requests
{
    public class CreatePilatesWorkoutRequest
    {
        public int PilatesProgramId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public int OrderIndex { get; set; }
    }
}