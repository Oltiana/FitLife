using FitLifeAPI.DTOs.Requests;
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

    public async Task<YogaResponse?> GetClassById(int id)
    {
        var x = await _repo.GetClassById(id);

        if (x == null)
            return null;

        return new YogaResponse
        {
            Id = x.Id,
            Title = x.Title,
            Level = x.Level,
            DurationMin = x.DurationMin,
            ImageUrl = x.ImageUrl
        };
    }

    public async Task<YogaClass> CreateClass(
        CreateYogaClassRequest req
    )
    {
        var yogaClass = new YogaClass
        {
            Title = req.Title,
            Level = req.Level,
            DurationMin = req.DurationMin,
            ImageUrl = req.ImageUrl
        };

        return await _repo.CreateClass(yogaClass);
    }

    public async Task UpdateClass(
        int id,
        UpdateYogaClassRequest req
    )
    {
        var yogaClass = await _repo.GetClassById(id);

        if (yogaClass == null)
            throw new Exception("Yoga class not found");

        yogaClass.Title = req.Title;
        yogaClass.Level = req.Level;
        yogaClass.DurationMin = req.DurationMin;
        yogaClass.ImageUrl = req.ImageUrl;

        await _repo.UpdateClass(yogaClass);
    }

    public async Task DeleteClass(int id)
    {
        await _repo.DeleteClass(id);
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

    public async Task<Session> CreateSession(
        CreateYogaSessionRequest req
    )
    {
        var session = new Session
        {
            YogaClassId = req.YogaClassId,
            StartTime = req.StartTime,
            Capacity = req.Capacity,
            InstructorName = req.Instructor,
            SessionDate = req.SessionDate
        };

        return await _repo.CreateSession(session);
    }

    public async Task UpdateSession(
        int id,
        UpdateYogaSessionRequest req
    )
    {
        var session = await _repo.GetSessionById(id);

        if (session == null)
            throw new Exception("Session not found");

        session.StartTime = req.StartTime;
        session.Capacity = req.Capacity;
        session.InstructorName = req.Instructor;
        session.SessionDate = req.SessionDate;

        await _repo.UpdateSession(session);
    }

    public async Task DeleteSession(int id)
    {
        await _repo.DeleteSession(id);
    }

    public async Task BookSession(
        int sessionId,
        string userName
    )
    {
        await _repo.BookSession(
            sessionId,
            userName
        );
    }

    public async Task<List<Booking>> GetBookings()
    {
        return await _repo.GetBookings();
    }

    public async Task DeleteBooking(int id)
    {
        await _repo.DeleteBooking(id);
    }


    public async Task<IEnumerable<UpcomingClass>> GetUpcomingClasses()
    {
        return await _repo.GetUpcomingClasses();
    }

    public async Task<UpcomingClass> CreateUpcomingClass(
        CreateUpcomingClassRequest req
    )
    {
        var upcoming = new UpcomingClass
        {
            Title = req.Title,
            InstructorName = req.InstructorName,
            Level = req.Level,
            ImageUrl = req.ImageUrl,
            StartDate = req.StartDate,
            StartTime = req.StartTime,
            YogaClassId = req.YogaClassId
        };

        return await _repo.CreateUpcomingClass(upcoming);
    }

    public async Task UpdateUpcomingClass(
        int id,
        UpdateUpcomingClassRequest req
    )
    {
        var upcoming = await _repo.GetUpcomingClassById(id);

        if (upcoming == null)
            throw new Exception("Upcoming class not found");

        upcoming.Title = req.Title;
        upcoming.InstructorName = req.InstructorName;
        upcoming.Level = req.Level;
        upcoming.ImageUrl = req.ImageUrl;
        upcoming.StartDate = req.StartDate;
        upcoming.StartTime = req.StartTime;
        upcoming.YogaClassId = req.YogaClassId;

        await _repo.UpdateUpcomingClass(upcoming);
    }

    public async Task DeleteUpcomingClass(int id)
    {
        await _repo.DeleteUpcomingClass(id);
    }

    public async Task<IEnumerable<YogaStep>> GetSteps(int yogaClassId)
    {
        return await _repo.GetSteps(yogaClassId);
    }

    public async Task<YogaStep> CreateStep(
        CreateYogaStepRequest req
    )
    {
        var step = new YogaStep
        {
            YogaClassId = req.YogaClassId,
            Title = req.Title,
            DurationSec = req.DurationSec,
            ImageUrl = req.ImageUrl,
            StepOrder = req.StepOrder
        };

        return await _repo.CreateStep(step);
    }

    public async Task UpdateStep(
        int id,
        UpdateYogaStepRequest req
    )
    {
        var step = await _repo.GetStepById(id);

        if (step == null)
            throw new Exception("Step not found");

        step.YogaClassId = req.YogaClassId;
        step.Title = req.Title;
        step.DurationSec = req.DurationSec;
        step.ImageUrl = req.ImageUrl;
        step.StepOrder = req.StepOrder;

        await _repo.UpdateStep(step);
    }

    public async Task DeleteStep(int id)
    {
        await _repo.DeleteStep(id);
    }
}