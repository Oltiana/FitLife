namespace FitLifeAPI.DTOs.Responses
{
    public class AnalyticsResponse
    {
        public List<DailyCount> UserRegistrations { get; set; } = new();
        public List<ModuleStat> ModuleStats { get; set; } = new();
    }

    public class DailyCount
    {
        public string Date { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class ModuleStat
    {
        public string Module { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}