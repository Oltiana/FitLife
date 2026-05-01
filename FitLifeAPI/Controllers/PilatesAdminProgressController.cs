using FitLife.Api.Data;
using FitLife.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitLife.Api.Controllers;

[ApiController]
[Route("api/pilates/admin/users")]
public class PilatesAdminProgressController : ControllerBase
{
    private readonly PilatesFitLifeDbContext _db;

    public PilatesAdminProgressController(PilatesFitLifeDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AdminUserDto>>> GetUsers(CancellationToken ct)
    {
        var completionUsers = _db.WorkoutCompletions
            .AsNoTracking()
            .Select(c => c.UserId);
        var preferenceUsers = _db.UserPreferences
            .AsNoTracking()
            .Select(p => p.UserId);
        var enrollmentUsers = _db.UserEnrollments
            .AsNoTracking()
            .Select(e => e.UserId);

        var users = await completionUsers
            .Union(preferenceUsers)
            .Union(enrollmentUsers)
            .Distinct()
            .OrderBy(id => id)
            .Select(id => new AdminUserDto(id, id))
            .ToListAsync(ct);

        return Ok(users);
    }

    [HttpGet("{userId}/completions")]
    public async Task<ActionResult<IReadOnlyList<AdminCompletionDto>>> GetCompletions(
        string userId,
        CancellationToken ct)
    {
        var list = await _db.WorkoutCompletions
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CompletedAt)
            .Select(c => new AdminCompletionDto(
                c.Id,
                c.UserId,
                c.WorkoutId,
                c.WorkoutTitle,
                c.CompletedAt,
                c.DurationMinutes,
                c.CaloriesBurned))
            .ToListAsync(ct);

        return Ok(list);
    }

    [HttpPost("{userId}/completions")]
    public async Task<ActionResult<AdminCompletionDto>> CreateCompletion(
        string userId,
        [FromBody] AdminCompletionWriteDto body,
        CancellationToken ct)
    {
        var id = string.IsNullOrWhiteSpace(body.Id)
            ? $"cmp-{Guid.NewGuid():N}"
            : body.Id.Trim();

        if (await _db.WorkoutCompletions.AnyAsync(c => c.Id == id, ct))
            return Conflict($"Completion with id '{id}' already exists.");

        var entity = new PilatesWorkoutCompletionEntity
        {
            Id = id,
            UserId = userId,
            WorkoutId = body.WorkoutId.Trim(),
            WorkoutTitle = body.WorkoutTitle.Trim(),
            CompletedAt = body.CompletedAt,
            DurationMinutes = body.DurationMinutes,
            CaloriesBurned = body.CaloriesBurned,
        };

        _db.WorkoutCompletions.Add(entity);
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(
            nameof(GetCompletions),
            new { userId },
            new AdminCompletionDto(
                entity.Id,
                entity.UserId,
                entity.WorkoutId,
                entity.WorkoutTitle,
                entity.CompletedAt,
                entity.DurationMinutes,
                entity.CaloriesBurned));
    }

    [HttpDelete("{userId}/completions/{completionId}")]
    public async Task<IActionResult> DeleteCompletion(
        string userId,
        string completionId,
        CancellationToken ct)
    {
        var entity = await _db.WorkoutCompletions
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Id == completionId, ct);
        if (entity is null)
            return NoContent();

        _db.WorkoutCompletions.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpGet("{userId}/preferences")]
    public async Task<ActionResult<AdminPreferencesDto>> GetPreferences(string userId, CancellationToken ct)
    {
        var row = await _db.UserPreferences
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);
        if (row is null)
            return NotFound();

        return Ok(new AdminPreferencesDto(
            row.OnboardingComplete,
            row.DailyCalorieTarget,
            row.DailyMinutesTarget));
    }

    [HttpGet("{userId}/enrollments")]
    public async Task<ActionResult<IReadOnlyList<AdminEnrollmentDto>>> GetEnrollments(
        string userId,
        CancellationToken ct)
    {
        var list = await _db.UserEnrollments
            .AsNoTracking()
            .Where(e => e.UserId == userId)
            .Select(e => new AdminEnrollmentDto(
                e.Id,
                e.UserId,
                e.ProgramId,
                e.EnrolledAt))
            .ToListAsync(ct);

        return Ok(list);
    }

    [HttpPost("{userId}/enrollments")]
    public async Task<IActionResult> CreateEnrollment(
        string userId,
        [FromBody] AdminEnrollmentCreateDto body,
        CancellationToken ct)
    {
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

public record AdminUserDto(string Id, string DisplayName);

public record AdminCompletionDto(
    string Id,
    string UserId,
    string WorkoutId,
    string WorkoutTitle,
    DateTime CompletedAt,
    int DurationMinutes,
    int? CaloriesBurned);

public record AdminCompletionWriteDto(
    string? Id,
    string WorkoutId,
    string WorkoutTitle,
    DateTime CompletedAt,
    int DurationMinutes,
    int? CaloriesBurned);

public record AdminPreferencesDto(
    bool OnboardingComplete,
    int? DailyCalorieTarget,
    int? DailyMinutesTarget);

public record AdminEnrollmentDto(
    string Id,
    string UserId,
    string ProgramId,
    DateTimeOffset EnrolledAt);

public record AdminEnrollmentCreateDto(string ProgramId);
