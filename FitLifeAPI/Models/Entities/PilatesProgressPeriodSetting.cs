namespace FitLifeAPI.Models.Entities
{
    /// <summary>Admin-defined goals and labels per day / week / month.</summary>
    public class PilatesProgressPeriodSetting
    {
        public int Id { get; set; }
        /// <summary>Daily, Weekly, or Monthly</summary>
        public string Period { get; set; } = "Daily";
        public string SectionTitle { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? TargetCalories { get; set; }
        public int? TargetMinutes { get; set; }
        public string? MinutesChartTitle { get; set; }
        public string? CaloriesChartTitle { get; set; }
        public int DisplayOrder { get; set; }
    }
}
