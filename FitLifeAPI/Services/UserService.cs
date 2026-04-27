using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.DTOs.Responses;
using FitLifeAPI.Repositories.Interfaces;
using FitLifeAPI.Services.Interfaces;

namespace FitLifeAPI.Services
{
    public class UserService : IUserService
    {
        private readonly IAuthRepository _authRepository;

        public UserService(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        public async Task<UserProfileResponse?> GetProfileAsync(int userId)
        {
            var user = await _authRepository.GetByIdAsync(userId);
            if (user == null) return null;

            return new UserProfileResponse
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                IsVerified = user.IsVerified,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<bool> UpdateProfileAsync(int userId, UpdateProfileRequest request)
        {
            var user = await _authRepository.GetByIdAsync(userId);
            if (user == null) return false;

            user.FullName = request.FullName;
            await _authRepository.UpdateAsync(user);
            return true;
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request)
        {
            var user = await _authRepository.GetByIdAsync(userId);
            if (user == null) return false;

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return false;

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _authRepository.UpdateAsync(user);
            return true;
        }
        public async Task<bool> DeleteAccountAsync(int userId)
{
    var user = await _authRepository.GetByIdAsync(userId);
    if (user == null) return false;

    await _authRepository.DeleteAsync(userId);
    return true;
}

public async Task<IEnumerable<ActiveSessionResponse>> GetActiveSessionsAsync(int userId)
{
    var sessions = await _authRepository.GetActiveSessionsAsync(userId);
    return sessions.Select(s => new ActiveSessionResponse
    {
        Id = s.Id,
        CreatedAt = s.CreatedAt,
        ExpiresAt = s.ExpiresAt
    });
}
    }
}