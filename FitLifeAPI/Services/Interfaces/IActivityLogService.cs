namespace FitLifeAPI.Services.Interfaces
{
    public interface IActivityLogService
    {
        Task LogAsync(int userId, string action, string entityType, string? entityId = null, string? description = null, string? ipAddress = null);
    }
}