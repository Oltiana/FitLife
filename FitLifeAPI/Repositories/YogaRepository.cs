using Microsoft.EntityFrameworkCore;
using FitLifeAPI.Data;
using FitLifeAPI.Models.Entities;
using FitLifeAPI.Repositories.Interfaces;

namespace FitLifeAPI.Repositories;

public class YogaRepository : IYogaRepository
{
    private readonly AppDbContext _context;

    public YogaRepository(AppDbContext context)
    {
        _context = context;
    }


    public async Task<List<YogaClass>> GetAllClasses()
    {
        return await _context.YogaClasses.ToListAsync();
    }

    public async Task<YogaClass?> GetClassById(int id)
    {
        return await _context.YogaClasses
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<YogaClass> CreateClass(YogaClass yogaClass)
    {
        _context.YogaClasses.Add(yogaClass);

        await _context.SaveChangesAsync();

        return yogaClass;
    }

    public async Task UpdateClass(YogaClass yogaClass)
    {
        _context.YogaClasses.Update(yogaClass);

        await _context.SaveChangesAsync();
    }

    public async Task DeleteClass(int id)
    {
        var yogaClass = await _context.YogaClasses
            .FirstOrDefaultAsync(x => x.Id == id);

        if (yogaClass == null)
            return;

        _context.YogaClasses.Remove(yogaClass);

        await _context.SaveChangesAsync();
    }


    public async Task<List<Session>> GetSessions()
    {
        return await _context.Sessions.ToListAsync();
    }

    public async Task<Session?> GetSessionById(int id)
    {
        return await _context.Sessions
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<Session> CreateSession(Session session)
    {
        _context.Sessions.Add(session);

        await _context.SaveChangesAsync();

        return session;
    }

    public async Task UpdateSession(Session session)
    {
        _context.Sessions.Update(session);

        await _context.SaveChangesAsync();
    }

    public async Task DeleteSession(int id)
    {
        var session = await _context.Sessions
            .FirstOrDefaultAsync(x => x.Id == id);

        if (session == null)
            return;

        _context.Sessions.Remove(session);

        await _context.SaveChangesAsync();
    }

    public async Task BookSession(
        int sessionId,
        string userName)
    {
        var session =
            await _context.Sessions.FindAsync(sessionId);

        if (session != null && session.Capacity > 0)
        {
            session.Capacity--;

            var booking = new Booking
            {
                SessionId = sessionId,
                UserName = userName,
                BookingDate = DateTime.Now
            };

            _context.Bookings.Add(booking);

            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<Booking>> GetBookings()
    {
        return await _context.Bookings.ToListAsync();
    }

    public async Task<Booking?> GetBookingById(int id)
    {
        return await _context.Bookings
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<Booking> CreateBooking(Booking booking)
    {
        _context.Bookings.Add(booking);

        await _context.SaveChangesAsync();

        return booking;
    }

    public async Task UpdateBooking(Booking booking)
    {
        _context.Bookings.Update(booking);

        await _context.SaveChangesAsync();
    }

    public async Task DeleteBooking(int id)
    {
        var booking = await _context.Bookings
            .FirstOrDefaultAsync(x => x.Id == id);

        if (booking == null)
            return;

        _context.Bookings.Remove(booking);

        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<UpcomingClass>> GetUpcomingClasses()
    {
        return await _context.UpcomingClasses.ToListAsync();
    }

    public async Task<UpcomingClass?> GetUpcomingClassById(int id)
    {
        return await _context.UpcomingClasses
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<UpcomingClass> CreateUpcomingClass(
        UpcomingClass upcomingClass
    )
    {
        _context.UpcomingClasses.Add(upcomingClass);

        await _context.SaveChangesAsync();

        return upcomingClass;
    }

    public async Task UpdateUpcomingClass(
        UpcomingClass upcomingClass
    )
    {
        _context.UpcomingClasses.Update(upcomingClass);

        await _context.SaveChangesAsync();
    }

    public async Task DeleteUpcomingClass(int id)
    {
        var upcomingClass = await _context.UpcomingClasses
            .FirstOrDefaultAsync(x => x.Id == id);

        if (upcomingClass == null)
            return;

        _context.UpcomingClasses.Remove(upcomingClass);

        await _context.SaveChangesAsync();
    }


    public async Task<IEnumerable<YogaStep>> GetSteps(int yogaClassId)
    {
        return await _context.YogaSteps
            .Where(x => x.YogaClassId == yogaClassId)
            .OrderBy(x => x.StepOrder)
            .ToListAsync();
    }

    public async Task<YogaStep?> GetStepById(int id)
    {
        return await _context.YogaSteps
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<YogaStep> CreateStep(YogaStep step)
    {
        _context.YogaSteps.Add(step);

        await _context.SaveChangesAsync();

        return step;
    }

    public async Task UpdateStep(YogaStep step)
    {
        _context.YogaSteps.Update(step);

        await _context.SaveChangesAsync();
    }

    public async Task DeleteStep(int id)
    {
        var step = await _context.YogaSteps
            .FirstOrDefaultAsync(x => x.Id == id);

        if (step == null)
            return;

        _context.YogaSteps.Remove(step);

        await _context.SaveChangesAsync();
    }
}