using FitLifeAPI.DTOs.Responses;
using FitLifeAPI.Repositories.Interfaces;
using FitLifeAPI.Services.Interfaces;
using FitLifeAPI.Models.Entities;

namespace FitLifeAPI.Services;

public class YogaService : IYogaService
{
    private readonly IYogaRepository _repo;

    public YogaService(IYogaRepository repo)
    {
        _repo = repo;
    }

    public async Task<List<YogaResponse>> GetClasses()
    {
        var data = await _repo.GetAllClasses();

        return data.Select(x => new YogaResponse
        {
            Id = x.Id,
            Title = x.Title,
            Level = x.Level,
            DurationMin = x.DurationMin,

            ImageUrl = string.IsNullOrWhiteSpace(x.ImageUrl)
                ? ""
                : x.ImageUrl.Trim()
        }).ToList();
    }

    public async Task<List<SessionResponse>> GetSessions()
    {
        var data = await _repo.GetSessions();

        return data.Select(x => new SessionResponse
        {
            Id = x.Id,
            StartTime = x.StartTime,
            Capacity = x.Capacity,
            InstructorName = x.InstructorName,
            YogaClassId = x.YogaClassId,
            SessionDate = x.SessionDate
        }).ToList();
    }

    public async Task BookSession(
        int sessionId,
        string userName)
    {
        await _repo.BookSession(
            sessionId,
            userName
        );
    }

    public async Task<IEnumerable<UpcomingClass>> GetUpcomingClasses()
    {
        return await _repo.GetUpcomingClasses();
    }

    public async Task<IEnumerable<YogaStep>> GetSteps(int yogaClassId)
    {
        return await _repo.GetSteps(yogaClassId);
    }
}