namespace FitLifeAPI.DTOs.Requests
{
    public class UpsertPilatesMotivationMessageRequest
    {
        public string Message { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
