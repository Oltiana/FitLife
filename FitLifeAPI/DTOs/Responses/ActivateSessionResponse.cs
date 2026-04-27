namespace FitLifeAPI.DTOs.Responses
{
    public class ActiveSessionResponse
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}