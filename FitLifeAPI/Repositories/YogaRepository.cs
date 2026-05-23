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

    public async Task<List<Session>> GetSessions()
    {
        return await _context.Sessions.ToListAsync();
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

    public async Task<IEnumerable<UpcomingClass>> GetUpcomingClasses()
    {
        return await _context.UpcomingClasses.ToListAsync();
    }

    public async Task<IEnumerable<YogaStep>> GetSteps(int yogaClassId)
    {
        return await _context.YogaSteps
            .Where(x => x.YogaClassId == yogaClassId)
            .OrderBy(x => x.StepOrder)
            .ToListAsync();
    }
}