using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.DTOs.Responses;
using FitLifeAPI.Models.Entities;

namespace FitLifeAPI.Services.Interfaces;

public interface IYogaService
{

    Task<List<YogaResponse>> GetClasses();

    Task<YogaResponse?> GetClassById(int id);

    Task<YogaClass> CreateClass(
        CreateYogaClassRequest req
    );

    Task UpdateClass(
        int id,
        UpdateYogaClassRequest req
    );

    Task DeleteClass(int id);


    Task<List<SessionResponse>> GetSessions();

    Task<Session> CreateSession(
        CreateYogaSessionRequest req
    );

    Task UpdateSession(
        int id,
        UpdateYogaSessionRequest req
    );

    Task DeleteSession(int id);


    Task BookSession(
        int sessionId,
        string userName
    );

    Task<List<Booking>> GetBookings();

    Task DeleteBooking(int id);


    Task<IEnumerable<UpcomingClass>> GetUpcomingClasses();

    Task<UpcomingClass> CreateUpcomingClass(
        CreateUpcomingClassRequest req
    );

    Task UpdateUpcomingClass(
        int id,
        UpdateUpcomingClassRequest req
    );

    Task DeleteUpcomingClass(int id);


    Task<IEnumerable<YogaStep>> GetSteps(int yogaClassId);

    Task<YogaStep> CreateStep(
        CreateYogaStepRequest req
    );

    Task UpdateStep(
        int id,
        UpdateYogaStepRequest req
    );

    Task DeleteStep(int id);
}