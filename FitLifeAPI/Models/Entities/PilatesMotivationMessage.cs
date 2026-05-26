namespace FitLifeAPI.Models.Entities
{
    public class PilatesMotivationMessage
    {
        public int Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
