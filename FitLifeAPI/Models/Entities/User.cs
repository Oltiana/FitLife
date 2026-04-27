namespace FitLifeAPI.Models.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public bool IsVerified { get; set; } = false;
        public string? VerificationToken { get; set; }
        public string? ResetPasswordToken { get; set; }
        public DateTime? ResetTokenExpiry { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}