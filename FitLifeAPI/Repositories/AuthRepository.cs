using Microsoft.EntityFrameworkCore;
using FitLifeAPI.Data;
using FitLifeAPI.Models.Entities;
using FitLifeAPI.Repositories.Interfaces;

namespace FitLifeAPI.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _context;

        public AuthRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByVerificationTokenAsync(string token)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.VerificationToken == token);
        }

        public async Task<User?> GetByResetTokenAsync(string token)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.ResetPasswordToken == token);
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
      public async Task SaveRefreshTokenAsync(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();
        }

        public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
        {
            return await _context.RefreshTokens
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == token
                                       && !r.IsRevoked
                                       && r.ExpiresAt > DateTime.UtcNow);
        }

        public async Task RevokeRefreshTokenAsync(string token)
        {
            var refreshToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(r => r.Token == token);

            if (refreshToken != null)
            {
                refreshToken.IsRevoked = true;
                await _context.SaveChangesAsync();
            }
        }
        public async Task<User?> GetByIdAsync(int id)
{
    return await _context.Users.FindAsync(id);
}
public async Task DeleteAsync(int userId)
{
    var user = await _context.Users.FindAsync(userId);
    if (user != null)
    {
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
    }
}

public async Task<IEnumerable<RefreshToken>> GetActiveSessionsAsync(int userId)
{
    return await _context.RefreshTokens
        .Where(r => r.UserId == userId && !r.IsRevoked && r.ExpiresAt > DateTime.UtcNow)
        .OrderByDescending(r => r.CreatedAt)
        .ToListAsync();
}
    }
}