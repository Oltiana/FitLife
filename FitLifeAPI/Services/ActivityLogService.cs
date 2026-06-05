using FitLifeAPI.Data;
using FitLifeAPI.Models.Entities;
using FitLifeAPI.Services.Interfaces;

namespace FitLifeAPI.Services
{
    public class ActivityLogService : IActivityLogService
    {
        private readonly AppDbContext _context;

        public ActivityLogService(AppDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(int userId, string action, string entityType, string? entityId = null, string? description = null, string? ipAddress = null)
        {
            var log = new ActivityLog
            {
                UserId = userId,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Description = description,
                IpAddress = ipAddress,
                CreatedAt = DateTime.UtcNow
            };

            _context.ActivityLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}