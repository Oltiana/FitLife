using FitLifeAPI.Models.Entities;

namespace FitLifeAPI.Repositories.Interfaces
{
    public interface IAuthRepository
    { 
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByVerificationTokenAsync(string token);
        Task<User?> GetByResetTokenAsync(string token);
        Task SaveRefreshTokenAsync(RefreshToken refreshToken);
        Task<RefreshToken?> GetRefreshTokenAsync(string token);
        Task RevokeRefreshTokenAsync(string token);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(int userId);
        Task<IEnumerable<RefreshToken>> GetActiveSessionsAsync(int userId);
    }
}