using FitLife.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitLife.Api.Controllers;

[ApiController]
[Route("api/pilates/programs")]
public class PilatesProgramsController : ControllerBase
{
    private readonly PilatesFitLifeDbContext _db;

    public PilatesProgramsController(PilatesFitLifeDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProgramDto>>> GetAll(CancellationToken ct)
    {
        var list = await _db.Programs
            .AsNoTracking()
            .OrderBy(p => p.Name)
            .Select(p => new ProgramDto(
                p.Id,
                p.Name,
                p.DurationWeeks,
                p.Level,
                p.ExercisesJson))
            .ToListAsync(ct);

        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProgramDto>> GetById(string id, CancellationToken ct)
    {
        var program = await _db.Programs
            .AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new ProgramDto(
                p.Id,
                p.Name,
                p.DurationWeeks,
                p.Level,
                p.ExercisesJson))
            .FirstOrDefaultAsync(ct);

        return program is null ? NotFound() : Ok(program);
    }

    [HttpPost]
    public async Task<ActionResult<ProgramDto>> Create(
        [FromBody] UpsertProgramRequest body,
        CancellationToken ct)
    {
        if (!TryValidateBody(body, out var validationError))
            return BadRequest(validationError);

        var id = string.IsNullOrWhiteSpace(body.Id)
            ? $"program-{Guid.NewGuid():N}"
            : body.Id.Trim();

        var exists = await _db.Programs.AnyAsync(p => p.Id == id, ct);
        if (exists)
            return Conflict($"Program with id '{id}' already exists.");

        var entity = new Models.PilatesProgramEntity
        {
            Id = id,
            Name = body.Name.Trim(),
            DurationWeeks = body.DurationWeeks,
            Level = body.Level.Trim().ToLowerInvariant(),
            ExercisesJson = body.ExercisesJson.Trim(),
        };

        _db.Programs.Add(entity);
        await _db.SaveChangesAsync(ct);

        var dto = new ProgramDto(
            entity.Id,
            entity.Name,
            entity.DurationWeeks,
            entity.Level,
            entity.ExercisesJson);

        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, dto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        string id,
        [FromBody] UpsertProgramRequest body,
        CancellationToken ct)
    {
        if (!TryValidateBody(body, out var validationError))
            return BadRequest(validationError);

        var entity = await _db.Programs.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (entity is null)
            return NotFound();

        entity.Name = body.Name.Trim();
        entity.DurationWeeks = body.DurationWeeks;
        entity.Level = body.Level.Trim().ToLowerInvariant();
        entity.ExercisesJson = body.ExercisesJson.Trim();

        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var entity = await _db.Programs.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (entity is null)
            return NoContent();

        var enrollments = await _db.UserEnrollments
            .Where(e => e.ProgramId == id)
            .ToListAsync(ct);
        if (enrollments.Count > 0)
            _db.UserEnrollments.RemoveRange(enrollments);

        _db.Programs.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static bool TryValidateBody(
        UpsertProgramRequest body,
        out string validationError)
    {
        if (string.IsNullOrWhiteSpace(body.Name))
        {
            validationError = "Name is required.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(body.Level))
        {
            validationError = "Level is required.";
            return false;
        }

        var level = body.Level.Trim().ToLowerInvariant();
        if (level is not ("beginner" or "intermediate" or "advanced"))
        {
            validationError = "Level must be one of: beginner, intermediate, advanced.";
            return false;
        }

        if (body.DurationWeeks <= 0 || body.DurationWeeks > 52)
        {
            validationError = "DurationWeeks must be between 1 and 52.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(body.ExercisesJson))
        {
            validationError = "ExercisesJson is required.";
            return false;
        }

        validationError = string.Empty;
        return true;
    }
}

public record ProgramDto(
    string Id,
    string Name,
    int DurationWeeks,
    string Level,
    string ExercisesJson
);

public record UpsertProgramRequest(
    string? Id,
    string Name,
    int DurationWeeks,
    string Level,
    string ExercisesJson
);
