namespace FitLifeAPI.DTOs.Requests
{
    public class UpdatePilatesProgramRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationWeeks { get; set; }
        public string Level { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
    }
}
