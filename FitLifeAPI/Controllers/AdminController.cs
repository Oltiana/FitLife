using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitLifeAPI.Data;
using FitLifeAPI.DTOs.Requests;

namespace FitLifeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalPilatesPrograms = await _context.PilatesPrograms.CountAsync();
            var totalYogaClasses = await _context.UpcomingClasses.CountAsync();
            var totalFitnessExercises = await _context.WorkoutPlans.CountAsync();

            return Ok(new
            {
                totalUsers,
                totalPilatesPrograms,
                totalYogaClasses,
                totalFitnessExercises,
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.IsVerified,
                    u.Role,
                    u.CreatedAt,
                    WorkoutPlans = u.WorkoutPlans.Count,
                    WorkoutSessions = u.WorkoutSessions.Count,
                    FavoriteExercises = u.FavoriteExercises.Count,
                })
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.IsVerified,
                    u.Role,
                    u.CreatedAt,
                    WorkoutPlans = u.WorkoutPlans.Count,
                    WorkoutSessions = u.WorkoutSessions.Count,
                    FavoriteExercises = u.FavoriteExercises.Count,
                })
                .FirstOrDefaultAsync();

            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpGet("users/{id}/details")]
public async Task<IActionResult> GetUserDetails(int id)
{
    var user = await _context.Users
        .Where(u => u.Id == id)
        .Select(u => new
        {
            u.Id,
            u.FullName,
            u.Email,
            u.IsVerified,
            u.Role,
            u.CreatedAt,
            WorkoutPlans = u.WorkoutPlans.Count,
            WorkoutSessions = u.WorkoutSessions.Count,
            FavoriteExercises = u.FavoriteExercises.Count,
            PilatesEnrollments = _context.UserPilatesEnrollments
                .Where(e => e.UserId == id)
                .Select(e => new
                {
                    e.Id,
                    ProgramName = e.Program.Name,
                    e.EnrolledAt,
                })
                .ToList(),
            PilatesProgress = _context.UserPilatesProgresses
                .Where(p => p.UserId == id)
                .Select(p => new
                {
                    p.Id,
                    p.ProgramName,
                    p.WorkoutName,
                    p.IsCompleted,
                    p.CompletedAt,
                })
                .ToList(),
            Bookings = _context.Bookings
                .Where(b => b.UserName == u.Email)
                .Select(b => new
                {
                    b.Id,
                    b.BookingDate,
                    b.SessionId,
                })
                .ToList(),
        })
        .FirstOrDefaultAsync();

    if (user == null) return NotFound();
    return Ok(user);
}

        [HttpPatch("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.Role = request.Role;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Role updated successfully" });
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "User deleted successfully" });
        }
    }
}