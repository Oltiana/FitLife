namespace FitLifeAPI.DTOs.Responses
{
    public class AuthResponse
    {
        public int UserId { get; set; }
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
        public string Role { get; set; } = "User";
    }
}