using FitLifeAPI.DTOs.Responses;
using FitLifeAPI.Models.Entities;

namespace FitLifeAPI.Services.Interfaces;

public interface IYogaService
{
    Task<List<YogaResponse>> GetClasses();

    Task<List<SessionResponse>> GetSessions();

    Task BookSession(
        int sessionId,
        string userName
    );

    Task<IEnumerable<UpcomingClass>> GetUpcomingClasses();

    Task<IEnumerable<YogaStep>> GetSteps(int yogaClassId);
}