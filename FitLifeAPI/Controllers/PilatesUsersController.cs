using FitLife.Api.Data;
using FitLife.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitLife.Api.Controllers;

[ApiController]
[Route("api/pilates/users")]
public class PilatesUsersController : ControllerBase
{
    public const string DefaultDemoUserId = "user-local-1";
    private readonly PilatesFitLifeDbContext _db;

    public PilatesUsersController(PilatesFitLifeDbContext db)
    {
        _db = db;
    }

    [HttpPost("bootstrap")]
    public async Task<IActionResult> Bootstrap(
        [FromBody] BootstrapUserRequest? body,
        CancellationToken ct)
    {
        await PilatesDbSeeder.SeedProgramsAsync(_db, ct);

        var userId = string.IsNullOrWhiteSpace(body?.UserId)
            ? DefaultDemoUserId
            : body!.UserId.Trim();
        var displayName = string.IsNullOrWhiteSpace(body?.DisplayName)
            ? "Local user"
            : body!.DisplayName!.Trim();

        if (!await _db.Users.AnyAsync(u => u.Id == userId, ct))
        {
            _db.Users.Add(new PilatesAppUser
            {
                Id = userId,
                DisplayName = displayName,
            });
            await _db.SaveChangesAsync(ct);
        }

        return NoContent();
    }

    [HttpGet("{userId}/completions")]
    public async Task<ActionResult<IReadOnlyList<CompletionDto>>> GetCompletions(
        string userId,
        CancellationToken ct)
    {
        var list = await _db.WorkoutCompletions
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CompletedAt)
            .Select(c => new CompletionDto(
                c.Id,
                c.WorkoutId,
                c.WorkoutTitle,
                c.CompletedAt,
                c.DurationMinutes,
                c.UserId,
                c.CaloriesBurned))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpPost("{userId}/completions")]
    public async Task<ActionResult<CompletionDto>> PostCompletion(
        string userId,
        [FromBody] CompletionCreateDto body,
        CancellationToken ct)
    {
        if (!await _db.Users.AnyAsync(u => u.Id == userId, ct))
            return NotFound("User not found. Call POST /api/pilates/users/bootstrap first.");

        var entity = new PilatesWorkoutCompletionEntity
        {
            Id = body.Id,
            UserId = userId,
            WorkoutId = body.WorkoutId,
            WorkoutTitle = body.WorkoutTitle,
            CompletedAt = body.CompletedAt,
            DurationMinutes = body.DurationMinutes,
            CaloriesBurned = body.CaloriesBurned,
        };
        _db.WorkoutCompletions.Add(entity);
        await _db.SaveChangesAsync(ct);

        return Ok(new CompletionDto(
            entity.Id,
            entity.WorkoutId,
            entity.WorkoutTitle,
            entity.CompletedAt,
            entity.DurationMinutes,
            entity.UserId,
            entity.CaloriesBurned));
    }

    [HttpGet("{userId}/preferences")]
    public async Task<ActionResult<PreferencesDto>> GetPreferences(string userId, CancellationToken ct)
    {
        var row = await _db.UserPreferences.AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);
        if (row == null)
            return NotFound();

        return Ok(new PreferencesDto(
            row.OnboardingComplete,
            row.DailyCalorieTarget,
            row.DailyMinutesTarget));
    }

    [HttpPut("{userId}/preferences")]
    public async Task<IActionResult> PutPreferences(
        string userId,
        [FromBody] PreferencesDto body,
        CancellationToken ct)
    {
        if (!await _db.Users.AnyAsync(u => u.Id == userId, ct))
            return NotFound("User not found.");

        var row = await _db.UserPreferences.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        if (row == null)
        {
            row = new PilatesUserPreferenceEntity { UserId = userId };
            _db.UserPreferences.Add(row);
        }

        row.OnboardingComplete = body.OnboardingComplete;
        row.DailyCalorieTarget = body.DailyCalorieTarget;
        row.DailyMinutesTarget = body.DailyMinutesTarget;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpGet("{userId}/enrollments")]
    public async Task<ActionResult<IReadOnlyList<EnrollmentDto>>> GetEnrollments(
        string userId,
        CancellationToken ct)
    {
        var list = await _db.UserEnrollments
            .AsNoTracking()
            .Where(e => e.UserId == userId)
            .Select(e => new EnrollmentDto(
                e.Id,
                e.UserId,
                e.ProgramId,
                e.EnrolledAt))
            .ToListAsync(ct);
        return Ok(list);
    }

    public record EnrollmentPostBody(string ProgramId);

    [HttpPost("{userId}/enrollments")]
    public async Task<IActionResult> PostEnrollment(
        string userId,
        [FromBody] EnrollmentPostBody body,
        CancellationToken ct)
    {
        if (!await _db.Users.AnyAsync(u => u.Id == userId, ct))
            return NotFound("User not found.");
        if (!await _db.Programs.AnyAsync(p => p.Id == body.ProgramId, ct))
            return BadRequest("Unknown program.");

        if (await _db.UserEnrollments.AnyAsync(
                e => e.UserId == userId && e.ProgramId == body.ProgramId,
                ct))
            return Ok();

        _db.UserEnrollments.Add(new PilatesUserEnrollmentEntity
        {
            Id = $"up-{Guid.NewGuid():N}",
            UserId = userId,
            ProgramId = body.ProgramId,
            EnrolledAt = DateTimeOffset.UtcNow,
        });
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    [HttpDelete("{userId}/enrollments/{programId}")]
    public async Task<IActionResult> DeleteEnrollment(
        string userId,
        string programId,
        CancellationToken ct)
    {
        var rows = await _db.UserEnrollments
            .Where(e => e.UserId == userId && e.ProgramId == programId)
            .ToListAsync(ct);
        if (rows.Count == 0)
            return NoContent();

        _db.UserEnrollments.RemoveRange(rows);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

}

public record BootstrapUserRequest(string? UserId, string? DisplayName);

public record CompletionDto(
    string Id,
    string WorkoutId,
    string WorkoutTitle,
    DateTime CompletedAt,
    int DurationMinutes,
    string? UserId,
    int? CaloriesBurned);

public record CompletionCreateDto(
    string Id,
    string WorkoutId,
    string WorkoutTitle,
    DateTime CompletedAt,
    int DurationMinutes,
    int? CaloriesBurned);

public record PreferencesDto(
    bool OnboardingComplete,
    int? DailyCalorieTarget,
    int? DailyMinutesTarget);

public record EnrollmentDto(
    string Id,
    string UserId,
    string ProgramId,
    DateTimeOffset EnrolledAt);
