using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.DTOs.Responses;
using FitLifeAPI.Models.Entities;
using FitLifeAPI.Repositories.Interfaces;
using FitLifeAPI.Services.Interfaces;

namespace FitLifeAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthService(IAuthRepository authRepository, IConfiguration configuration, IEmailService emailService)
        {
            _authRepository = authRepository;
            _configuration = configuration;
            _emailService = emailService;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var existingUser = await _authRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
                throw new Exception("Email already exists");

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                VerificationToken = GenerateToken()
            };

            await _authRepository.AddAsync(user);

            await _emailService.SendEmailAsync(
                user.Email,
                "Verify your email - FitLife",
                $@"
                <h2>Welcome to FitLife!</h2>
                
                <p>If you did not create an account, ignore this email.</p>
                "
            );

            var refreshToken = await CreateAndSaveRefreshTokenAsync(user.Id);

            return new AuthResponse
            {
                Token = GenerateJwtToken(user),
                RefreshToken = refreshToken,
                FullName = user.FullName,
                Email = user.Email,
                IsVerified = user.IsVerified
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _authRepository.GetByEmailAsync(request.Email);
            if (user == null)
                throw new Exception("User not found");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new Exception("Invalid password");

            var refreshToken = await CreateAndSaveRefreshTokenAsync(user.Id);

            return new AuthResponse
            {
                Token = GenerateJwtToken(user),
                RefreshToken = refreshToken,
                FullName = user.FullName,
                Email = user.Email,
                IsVerified = user.IsVerified
            };
        }

        public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken)
        {
            var existing = await _authRepository.GetRefreshTokenAsync(refreshToken);
            if (existing == null)
                return null;

            await _authRepository.RevokeRefreshTokenAsync(refreshToken);

            var newRefreshToken = await CreateAndSaveRefreshTokenAsync(existing.UserId);

            return new AuthResponse
            {
                Token = GenerateJwtToken(existing.User),
                RefreshToken = newRefreshToken,
                FullName = existing.User.FullName,
                Email = existing.User.Email,
                IsVerified = existing.User.IsVerified
            };
        }

        public async Task<bool> VerifyEmailAsync(string token)
        {
            var user = await _authRepository.GetByVerificationTokenAsync(token);
            if (user == null)
                return false;

            user.IsVerified = true;
            user.VerificationToken = null;
            await _authRepository.UpdateAsync(user);
            return true;
        }

        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await _authRepository.GetByEmailAsync(email);
            if (user == null)
                return false;

            user.ResetPasswordToken = GenerateToken();
            user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1);
            await _authRepository.UpdateAsync(user);

            await _emailService.SendEmailAsync(
                user.Email,
                "Reset your password - FitLife",
                $@"
                <h2>Reset Password</h2>
            
                <p>If you did not request a password reset, ignore this email.</p>
                "
            );

            return true;
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            var user = await _authRepository.GetByResetTokenAsync(token);
            if (user == null || user.ResetTokenExpiry < DateTime.UtcNow)
                return false;

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.ResetPasswordToken = null;
            user.ResetTokenExpiry = null;
            await _authRepository.UpdateAsync(user);
            return true;
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateToken()
        {
            return Convert.ToHexString(RandomNumberGenerator.GetBytes(64));
        }

        private async Task<string> CreateAndSaveRefreshTokenAsync(int userId)
        {
            var refreshToken = new RefreshToken
            {
                UserId = userId,
                Token = GenerateToken(),
                ExpiresAt = DateTime.UtcNow.AddDays(30)
            };
            await _authRepository.SaveRefreshTokenAsync(refreshToken);
            return refreshToken.Token;
        }
    }
}