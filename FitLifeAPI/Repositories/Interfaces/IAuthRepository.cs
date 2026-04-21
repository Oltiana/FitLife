using FitLifeAPI.Models.Entities;

namespace FitLifeAPI.Repositories.Interfaces
{
    public interface IAuthRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByVerificationTokenAsync(string token);
        Task<User?> GetByResetTokenAsync(string token);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
    }
}