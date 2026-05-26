namespace FitLifeAPI.DTOs.Requests
{
    public class UpdatePilatesProgressUiConfigRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public string MotivationLabel { get; set; } = string.Empty;
        public string DailyTargetsTitle { get; set; } = string.Empty;
        public string DailyTargetsHint { get; set; } = string.Empty;
    }
}
