using FitLifeAPI.Models.Entities;

namespace FitLifeAPI.Repositories.Interfaces;

public interface IYogaRepository
{
    Task<List<YogaClass>> GetAllClasses();

    Task<YogaClass?> GetClassById(int id);

    Task<YogaClass> CreateClass(YogaClass yogaClass);

    Task UpdateClass(YogaClass yogaClass);

    Task DeleteClass(int id);


    Task<List<Session>> GetSessions();

    Task<Session?> GetSessionById(int id);

    Task<Session> CreateSession(Session session);

    Task UpdateSession(Session session);

    Task DeleteSession(int id);


    Task BookSession(
        int sessionId,
        string userName
    );

    Task<List<Booking>> GetBookings();

    Task<Booking?> GetBookingById(int id);

    Task<Booking> CreateBooking(Booking booking);

    Task UpdateBooking(Booking booking);

    Task DeleteBooking(int id);


    Task<IEnumerable<UpcomingClass>> GetUpcomingClasses();

    Task<UpcomingClass?> GetUpcomingClassById(int id);

    Task<UpcomingClass> CreateUpcomingClass(
        UpcomingClass upcoming
    );

    Task UpdateUpcomingClass(
        UpcomingClass upcoming
    );

    Task DeleteUpcomingClass(int id);

    Task<IEnumerable<YogaStep>> GetSteps(int yogaClassId);

    Task<YogaStep?> GetStepById(int id);

    Task<YogaStep> CreateStep(YogaStep step);

    Task UpdateStep(YogaStep step);

    Task DeleteStep(int id);
}