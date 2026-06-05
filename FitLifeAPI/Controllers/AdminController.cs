using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitLifeAPI.Data;
using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.Services;

namespace FitLifeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Inspector,FitnessManager")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        [Authorize(Roles = "Admin,Inspector,FitnessManager")]
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
        [Authorize(Roles = "Admin")]
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
        [Authorize(Roles = "Admin")]
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
        [Authorize(Roles = "Admin")]
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

        [HttpGet("pilates/progress")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPilatesProgress([FromQuery] int? programId)
        {
            var query = _context.UserPilatesProgresses
                .Include(p => p.User)
                .Include(p => p.Workout)
                .AsQueryable();

            if (programId.HasValue)
            {
                query = query.Where(p => p.Workout.PilatesProgramId == programId.Value);
            }

            var list = await query
                .OrderByDescending(p => p.CompletedAt ?? DateTime.MinValue)
                .ThenByDescending(p => p.Id)
                .Select(p => new
                {
                    p.Id,
                    p.UserId,
                    UserFullName = p.User.FullName,
                    UserEmail = p.User.Email,
                    p.ProgramName,
                    p.WorkoutName,
                    p.IsCompleted,
                    p.CompletedAt,
                    PilatesProgramId = p.Workout.PilatesProgramId,
                })
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("pilates/enrollments")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPilatesEnrollments([FromQuery] int? programId)
        {
            var query = _context.UserPilatesEnrollments
                .Include(e => e.User)
                .Include(e => e.Program)
                .AsQueryable();

            if (programId.HasValue)
            {
                query = query.Where(e => e.PilatesProgramId == programId.Value);
            }

            var list = await query
                .OrderByDescending(e => e.EnrolledAt)
                .Select(e => new
                {
                    e.Id,
                    e.UserId,
                    UserFullName = e.User.FullName,
                    UserEmail = e.User.Email,
                    PilatesProgramId = e.PilatesProgramId,
                    ProgramName = e.Program.Name,
                    e.EnrolledAt,
                    e.CompletedAt,
                })
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("pilates/progress-content")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPilatesProgressContentAdmin()
        {
            await PilatesProgressContentHelper.EnsureSeedAsync(_context);
            return Ok(await PilatesProgressContentHelper.GetContentAsync(_context));
        }

        [HttpPut("pilates/progress-ui")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePilatesProgressUi(
            [FromBody] UpdatePilatesProgressUiConfigRequest request)
        {
            await PilatesProgressContentHelper.EnsureSeedAsync(_context);
            var ui = await PilatesProgressContentHelper.GetUiConfigAsync(_context);

            ui.Title = request.Title.Trim();
            ui.Subtitle = request.Subtitle.Trim();
            ui.MotivationLabel = request.MotivationLabel.Trim();
            ui.DailyTargetsTitle = request.DailyTargetsTitle.Trim();
            ui.DailyTargetsHint = request.DailyTargetsHint.Trim();
            await _context.SaveChangesAsync();
            return Ok(ui);
        }

        [HttpPut("pilates/progress-periods/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePilatesProgressPeriod(
            int id,
            [FromBody] UpdatePilatesProgressPeriodRequest request)
        {
            var row = await _context.PilatesProgressPeriodSettings.FindAsync(id);
            if (row == null) return NotFound();

            row.SectionTitle = request.SectionTitle.Trim();
            row.Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim();
            row.TargetCalories = request.TargetCalories is > 0 ? request.TargetCalories : null;
            row.TargetMinutes = request.TargetMinutes is > 0 ? request.TargetMinutes : null;
            row.MinutesChartTitle = string.IsNullOrWhiteSpace(request.MinutesChartTitle)
                ? null
                : request.MinutesChartTitle.Trim();
            row.CaloriesChartTitle = string.IsNullOrWhiteSpace(request.CaloriesChartTitle)
                ? null
                : request.CaloriesChartTitle.Trim();
            row.DisplayOrder = request.DisplayOrder;
            await _context.SaveChangesAsync();
            return Ok(row);
        }

        [HttpGet("pilates/motivation-messages")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetMotivationMessages()
        {
            await PilatesProgressContentHelper.EnsureSeedAsync(_context);
            var list = await _context.PilatesMotivationMessages
                .OrderBy(m => m.DisplayOrder)
                .ThenBy(m => m.Id)
                .ToListAsync();
            return Ok(list);
        }

        [HttpPost("pilates/motivation-messages")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateMotivationMessage(
            [FromBody] UpsertPilatesMotivationMessageRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest("Message is required.");

            var row = new Models.Entities.PilatesMotivationMessage
            {
                Message = request.Message.Trim(),
                DisplayOrder = request.DisplayOrder,
                IsActive = request.IsActive,
            };
            _context.PilatesMotivationMessages.Add(row);
            await _context.SaveChangesAsync();
            return Ok(row);
        }

        [HttpPut("pilates/motivation-messages/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateMotivationMessage(
            int id,
            [FromBody] UpsertPilatesMotivationMessageRequest request)
        {
            var row = await _context.PilatesMotivationMessages.FindAsync(id);
            if (row == null) return NotFound();
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest("Message is required.");

            row.Message = request.Message.Trim();
            row.DisplayOrder = request.DisplayOrder;
            row.IsActive = request.IsActive;
            await _context.SaveChangesAsync();
            return Ok(row);
        }

        [HttpDelete("pilates/motivation-messages/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMotivationMessage(int id)
        {
            var row = await _context.PilatesMotivationMessages.FindAsync(id);
            if (row == null) return NotFound();
            _context.PilatesMotivationMessages.Remove(row);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("users/{id}/role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.Role = request.Role;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Role updated successfully" });
        }

        [HttpDelete("users/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "User deleted successfully" });
        }

        [HttpGet("analytics")]
        [Authorize(Roles = "Admin,Inspector,FitnessManager")]
        public async Task<IActionResult> GetAnalytics()
        {
            var users = await _context.Users
                .Select(u => new { u.CreatedAt })
                .ToListAsync();

            var userRegistrations = users
                .GroupBy(u => u.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Count = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToList();

            var moduleStats = new[]
            {
                new { Module = "Pilates", Count = await _context.UserPilatesEnrollments.CountAsync() },
                new { Module = "Yoga",    Count = await _context.Bookings.CountAsync() },
                new { Module = "Fitness", Count = await _context.WorkoutPlans.CountAsync() },
            };

            return Ok(new { userRegistrations, moduleStats });
        }

        [HttpGet("fitness/workout-plans")]
        [Authorize(Roles = "Admin,FitnessManager")]
        public async Task<IActionResult> GetFitnessWorkoutPlans()
        {
            var plans = await _context.WorkoutPlans
                .Include(wp => wp.User)
                .Include(wp => wp.WorkoutExercises)
                .Include(wp => wp.WorkoutSessions)
                .OrderByDescending(wp => wp.CreatedAt)
                .Select(wp => new
                {
                    wp.Id,
                    wp.Name,
                    wp.Description,
                    wp.Level,
                    wp.CreatedAt,
                    UserId = wp.UserId,
                    UserName = wp.User.FullName,
                    UserEmail = wp.User.Email,
                    ExercisesCount = wp.WorkoutExercises.Count,
                    SessionsCount = wp.WorkoutSessions.Count,
                    Exercises = wp.WorkoutExercises
                        .OrderBy(e => e.OrderIndex)
                        .Select(e => new
                        {
                            e.Id,
                            e.ExerciseName,
                            e.BodyPart,
                            e.TargetMuscle,
                            e.Sets,
                            e.Reps,
                            e.OrderIndex
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(plans);
        }

        [HttpPut("fitness/workout-plans/{id}")]
        [Authorize(Roles = "Admin,FitnessManager")]
        public async Task<IActionResult> UpdateFitnessWorkoutPlan(
            int id,
            [FromBody] CreateWorkoutPlanRequest request)
        {
            var plan = await _context.WorkoutPlans.FindAsync(id);
            if (plan == null) return NotFound();

            plan.Name = request.Name;
            plan.Description = request.Description;
            plan.Level = request.Level;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Workout plan updated successfully" });
        }

        [HttpDelete("fitness/workout-plans/{id}")]
        [Authorize(Roles = "Admin,FitnessManager")]
        public async Task<IActionResult> DeleteFitnessWorkoutPlan(int id)
        {
            var plan = await _context.WorkoutPlans.FindAsync(id);
            if (plan == null) return NotFound();

            _context.WorkoutPlans.Remove(plan);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Workout plan deleted successfully" });
        }
        [HttpGet("activity-logs")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> GetActivityLogs(
    [FromQuery] int? userId = null,
    [FromQuery] string? entityType = null,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 50)
{
    var query = _context.ActivityLogs
        .Include(a => a.User)
        .AsQueryable();

    if (userId.HasValue)
        query = query.Where(a => a.UserId == userId.Value);

    if (!string.IsNullOrEmpty(entityType))
        query = query.Where(a => a.EntityType == entityType);

    var total = await query.CountAsync();

    var logs = await query
        .OrderByDescending(a => a.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(a => new
        {
            a.Id,
            a.UserId,
            UserFullName = a.User.FullName,
            UserEmail = a.User.Email,
            a.Action,
            a.EntityType,
            a.EntityId,
            a.Description,
            a.IpAddress,
            a.CreatedAt
        })
        .ToListAsync();

    return Ok(new { total, page, pageSize, logs });
}

[HttpGet("enrollments")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> GetAllEnrollments()
{
    var users = await _context.Users
        .Select(u => new
        {
            u.Id,
            u.FullName,
            u.Email,
            PilatesEnrollments = _context.UserPilatesEnrollments
                .Where(e => e.UserId == u.Id)
                .Select(e => new
                {
                    e.Id,
                    ProgramName = e.Program.Name,
                    e.EnrolledAt,
                    e.CompletedAt
                })
                .ToList(),
            YogaBookings = _context.Bookings
                .Where(b => b.UserName == u.Email)
                .Select(b => new
                {
                    b.Id,
                    b.BookingDate,
                    b.SessionId
                })
                .ToList(),
            FitnessPlans = _context.WorkoutPlans
                .Where(w => w.UserId == u.Id)
                .Select(w => new
                {
                    w.Id,
                    w.Name,
                    w.Level,
                    w.CreatedAt
                })
                .ToList()
        })
        .ToListAsync();

    return Ok(users);
}
    }
}