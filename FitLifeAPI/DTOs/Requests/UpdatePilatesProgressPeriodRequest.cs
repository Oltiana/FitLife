namespace FitLifeAPI.DTOs.Requests
{
    public class UpdatePilatesProgressPeriodRequest
    {
        public string SectionTitle { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? TargetCalories { get; set; }
        public int? TargetMinutes { get; set; }
        public string? MinutesChartTitle { get; set; }
        public string? CaloriesChartTitle { get; set; }
        public int DisplayOrder { get; set; }
    }
}
