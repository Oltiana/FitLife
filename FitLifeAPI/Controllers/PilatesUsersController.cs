using FitLife.Api.Data;
using FitLife.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FitLife.Api.Controllers;

[ApiController]
[Route("api/pilates/users")]
public class PilatesUsersController : ControllerBase
{
    public const string DefaultDemoUserId = "user-local-1";
    private readonly PilatesFitLifeDbContext _db;
    private readonly ILogger<PilatesUsersController> _logger;

    public PilatesUsersController(
        PilatesFitLifeDbContext db,
        ILogger<PilatesUsersController> logger)
    {
        _db = db;
        _logger = logger;
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
        _ = userId;

        return NoContent();
    }

    [HttpGet("{userId}/completions")]
    public async Task<ActionResult<IReadOnlyList<CompletionDto>>> GetCompletions(
        string userId,
        CancellationToken ct)
    {
        /* Kohë reale: më e hershme (dje) sipër, më e fundit (sot) poshtë — jo DisplayOrder (mund të përzihet me user/ditë). */
        var list = await _db.WorkoutCompletions
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.CompletedAt)
            .ThenBy(c => c.Id)
            .Select(c => new CompletionDto(
                c.Id,
                c.WorkoutId,
                c.WorkoutTitle,
                c.CompletedAt,
                c.DurationMinutes,
                c.UserId,
                c.CaloriesBurned,
                c.DisplayOrder))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpPost("{userId}/completions")]
    public async Task<ActionResult<CompletionDto>> PostCompletion(
        string userId,
        [FromBody] CompletionCreateDto? body,
        CancellationToken ct)
    {
        if (body == null || string.IsNullOrWhiteSpace(body.Id))
            return BadRequest("Missing completion body or id.");
        if (string.IsNullOrWhiteSpace(body.WorkoutId) || string.IsNullOrWhiteSpace(body.WorkoutTitle))
            return BadRequest("Missing workoutId or workoutTitle.");

        var id = body.Id.Trim();
        var existing = await _db.WorkoutCompletions.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, ct);
        if (existing != null)
        {
            return Ok(new CompletionDto(
                existing.Id,
                existing.WorkoutId,
                existing.WorkoutTitle,
                existing.CompletedAt,
                existing.DurationMinutes,
                existing.UserId,
                existing.CaloriesBurned,
                existing.DisplayOrder));
        }

        var uid = userId.Trim();
        var wid = body.WorkoutId.Trim();
        var title = body.WorkoutTitle.Trim();

        /* MAX në C# me të njëjtin UserId si EF — në SQL të interpoluar MAX+1 shpesh kthente 1 (WHERE UserId nuk përputej me rreshtat). */
        var maxDisplayOrder = await _db.WorkoutCompletions
            .AsNoTracking()
            .Where(c => c.UserId == uid)
            .MaxAsync(c => (int?)c.DisplayOrder, ct) ?? 0;
        var nextDisplayOrder = maxDisplayOrder + 1;

        /* INSERT i drejtpërdrejtë — shmang probleme të rrallë me ChangeTracker / gjendje të modelit. */
        try
        {
            var rows = await _db.Database.ExecuteSqlInterpolatedAsync(
                $"""
                INSERT INTO [dbo].[PilatesWorkoutCompletions] ([Id],[WorkoutId],[WorkoutTitle],[CompletedAt],[DurationMinutes],[UserId],[CaloriesBurned],[DisplayOrder])
                VALUES ({id},{wid},{title},{body.CompletedAt},{body.DurationMinutes},{uid},{body.CaloriesBurned},{nextDisplayOrder})
                """,
                ct);
            if (rows != 1)
                _logger.LogWarning("Completion INSERT affected {Rows} row(s) for id {Id}", rows, id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "INSERT failed for completion {Id}, user {UserId}", id, uid);
            return Problem(
                detail: ex.InnerException?.Message ?? ex.Message,
                statusCode: 500,
                title: "Could not save completion to database.");
        }

        var entity = await _db.WorkoutCompletions.AsNoTracking()
            .FirstAsync(c => c.Id == id, ct);

        _logger.LogInformation(
            "Saved workout completion {CompletionId} for user {UserId}",
            entity.Id,
            entity.UserId);

        return Ok(new CompletionDto(
            entity.Id,
            entity.WorkoutId,
            entity.WorkoutTitle,
            entity.CompletedAt,
            entity.DurationMinutes,
            entity.UserId,
            entity.CaloriesBurned,
            entity.DisplayOrder));
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

    [HttpGet("{userId}/weights")]
    public async Task<ActionResult<IReadOnlyList<WeightEntryResponseDto>>> GetWeights(
        string userId,
        CancellationToken ct)
    {
        var list = await _db.WeightEntries
            .AsNoTracking()
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.LoggedAt)
            .Select(w => new WeightEntryResponseDto(w.Id, w.UserId, w.LoggedAt, w.Kg))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpPost("{userId}/weights")]
    public async Task<ActionResult<WeightEntryResponseDto>> PostWeight(
        string userId,
        [FromBody] WeightEntryCreateDto? body,
        CancellationToken ct)
    {
        if (body is null || !body.LoggedAt.HasValue || !body.Kg.HasValue)
            return BadRequest("Payload must include loggedAt and kg.");

        var loggedAt = body.LoggedAt.Value;
        var kg = body.Kg.Value;

        if (kg <= 0m || kg > 1000m)
            return BadRequest("kg must be between 0 and 1000.");

        var id = string.IsNullOrWhiteSpace(body.Id)
            ? $"w-{Guid.NewGuid():N}"
            : body.Id.Trim();

        var existing = await _db.WeightEntries.FirstOrDefaultAsync(w => w.Id == id, ct);
        if (existing != null)
        {
            if (existing.UserId != userId)
                return Conflict("Weight entry id belongs to another user.");

            existing.LoggedAt = loggedAt;
            existing.Kg = kg;
            await _db.SaveChangesAsync(ct);
            return Ok(new WeightEntryResponseDto(
                existing.Id,
                existing.UserId,
                existing.LoggedAt,
                existing.Kg));
        }

        var entity = new PilatesWeightEntryEntity
        {
            Id = id,
            UserId = userId,
            LoggedAt = loggedAt,
            Kg = kg,
        };
        _db.WeightEntries.Add(entity);
        await _db.SaveChangesAsync(ct);

        return Ok(new WeightEntryResponseDto(
            entity.Id,
            entity.UserId,
            entity.LoggedAt,
            entity.Kg));
    }

    [HttpDelete("{userId}/weights/{weightId}")]
    public async Task<IActionResult> DeleteWeight(
        string userId,
        string weightId,
        CancellationToken ct)
    {
        var row = await _db.WeightEntries.FirstOrDefaultAsync(
            w => w.UserId == userId && w.Id == weightId,
            ct);
        if (row == null)
            return NoContent();

        _db.WeightEntries.Remove(row);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

}

/// <summary>Class binding for JSON body from mobile (camelCase).</summary>
public sealed class BootstrapUserRequest
{
    public string? UserId { get; set; }
    public string? DisplayName { get; set; }
}

public record CompletionDto(
    string Id,
    string WorkoutId,
    string WorkoutTitle,
    DateTimeOffset CompletedAt,
    int DurationMinutes,
    string? UserId,
    int? CaloriesBurned,
    int DisplayOrder);

/// <summary>JSON nga mobile (camelCase) — përdoret STJ global camelCase policy.</summary>
public sealed class CompletionCreateDto
{
    public string Id { get; set; } = "";
    public string WorkoutId { get; set; } = "";
    public string WorkoutTitle { get; set; } = "";
    public DateTimeOffset CompletedAt { get; set; }
    public int DurationMinutes { get; set; }
    public int? CaloriesBurned { get; set; }
}

public record PreferencesDto(
    bool OnboardingComplete,
    int? DailyCalorieTarget,
    int? DailyMinutesTarget);

public record EnrollmentDto(
    string Id,
    string UserId,
    string ProgramId,
    DateTimeOffset EnrolledAt);

public record WeightEntryResponseDto(
    string Id,
    string UserId,
    DateTime LoggedAt,
    decimal Kg);

/// <summary>
/// Class (not positional record) so JSON model binding is reliable across STJ versions.
/// </summary>
public sealed class WeightEntryCreateDto
{
    public string? Id { get; set; }
    public DateTime? LoggedAt { get; set; }
    public decimal? Kg { get; set; }
}
