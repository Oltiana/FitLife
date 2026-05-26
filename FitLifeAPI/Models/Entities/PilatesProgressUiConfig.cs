namespace FitLifeAPI.Models.Entities
{
    /// <summary>Singleton row for Progress screen copy (first row in table).</summary>
    public class PilatesProgressUiConfig
    {
        public int Id { get; set; }
        public string Title { get; set; } = "Progress";
        public string Subtitle { get; set; } = "Track sessions, streaks, and daily goals.";
        public string MotivationLabel { get; set; } = "Keep going";
        public string DailyTargetsTitle { get; set; } = "Daily targets";
        public string DailyTargetsHint { get; set; } = "Optional. Progress bars use today's totals only.";
    }
}
