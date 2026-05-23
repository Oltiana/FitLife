using FitLifeAPI.Models.Entities;

namespace FitLifeAPI.Repositories.Interfaces;

public interface IYogaRepository
{
    Task<List<YogaClass>> GetAllClasses();

    Task<List<Session>> GetSessions();

    Task BookSession(
        int sessionId,
        string userName
    );

    Task<IEnumerable<UpcomingClass>> GetUpcomingClasses();

    Task<IEnumerable<YogaStep>> GetSteps(int yogaClassId);
}