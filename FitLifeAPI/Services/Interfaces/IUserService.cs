using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.DTOs.Responses;

namespace FitLifeAPI.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserProfileResponse?> GetProfileAsync(int userId);
        Task<bool> UpdateProfileAsync(int userId, UpdateProfileRequest request);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request);
        Task<bool> DeleteAccountAsync(int userId);
        Task<IEnumerable<ActiveSessionResponse>> GetActiveSessionsAsync(int userId);
    }
}