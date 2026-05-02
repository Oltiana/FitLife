using FitLife.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace FitLife.Api.Controllers;

[ApiController]
[Route("api/pilates/programs")]
public class PilatesProgramsController : ControllerBase
{
    private readonly PilatesFitLifeDbContext _db;
    private static readonly JsonSerializerOptions StepJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    public PilatesProgramsController(PilatesFitLifeDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProgramDto>>> GetAll(CancellationToken ct)
    {
        var programs = await _db.Programs
            .AsNoTracking()
            .OrderBy(p => p.DisplayOrder)
            .ThenBy(p => p.Name)
            .ToListAsync(ct);

        var list = programs.Select(ToProgramDto).ToList();
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProgramDto>> GetById(string id, CancellationToken ct)
    {
        var program = await _db.Programs
            .AsNoTracking()
            .Where(p => p.Id == id)
            .FirstOrDefaultAsync(ct);

        return program is null ? NotFound() : Ok(ToProgramDto(program));
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

        var maxOrder = await _db.Programs.MaxAsync(p => (int?)p.DisplayOrder, ct) ?? 0;
        var displayOrder =
            body.DisplayOrder is >= 0 and var requestedOrder
                ? requestedOrder
                : maxOrder + 1;

        var entity = new Models.PilatesProgramEntity
        {
            Id = id,
            Name = body.Name.Trim(),
            DurationWeeks = body.DurationWeeks,
            Level = body.Level.Trim().ToLowerInvariant(),
            ExercisesJson = body.ExercisesJson.Trim(),
            DisplayOrder = displayOrder,
        };

        _db.Programs.Add(entity);
        await _db.SaveChangesAsync(ct);

        var dto = new ProgramDto(
            entity.Id,
            entity.Name,
            entity.DurationWeeks,
            entity.Level,
            entity.ExercisesJson,
            ParseSteps(entity.ExercisesJson),
            entity.DisplayOrder);

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
        if (body.DisplayOrder is >= 0 and var d)
            entity.DisplayOrder = d;

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

    [HttpPost("{id}/steps")]
    public async Task<ActionResult<ProgramDto>> AddStep(
        string id,
        [FromBody] AddProgramStepRequest body,
        CancellationToken ct)
    {
        if (!TryValidateStepBody(body, out var stepValidationError))
            return BadRequest(stepValidationError);

        var entity = await _db.Programs.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (entity is null)
            return NotFound("Program not found.");

        List<ProgramStepDto> steps;
        try
        {
            steps = JsonSerializer.Deserialize<List<ProgramStepDto>>(entity.ExercisesJson, StepJsonOptions) ?? [];
        }
        catch
        {
            return BadRequest("Program exercisesJson is invalid JSON.");
        }

        var stepId = string.IsNullOrWhiteSpace(body.Id)
            ? $"step-{Guid.NewGuid():N}"
            : body.Id.Trim();

        if (steps.Any(s => string.Equals(s.Id, stepId, StringComparison.OrdinalIgnoreCase)))
            return Conflict($"Step with id '{stepId}' already exists.");

        steps = steps
            .Where(s =>
                !string.IsNullOrWhiteSpace(s.Id) &&
                !string.IsNullOrWhiteSpace(s.Name) &&
                !string.IsNullOrWhiteSpace(s.Description) &&
                s.DurationSec > 0)
            .ToList();

        steps.Add(new ProgramStepDto(
            stepId,
            body.Name.Trim(),
            body.DurationSec,
            body.Description.Trim()));

        entity.ExercisesJson = JsonSerializer.Serialize(steps, StepJsonOptions);
        await _db.SaveChangesAsync(ct);

        return Ok(new ProgramDto(
            entity.Id,
            entity.Name,
            entity.DurationWeeks,
            entity.Level,
            entity.ExercisesJson,
            ParseSteps(entity.ExercisesJson),
            entity.DisplayOrder));
    }

    [HttpGet("{id}/steps")]
    public async Task<ActionResult<IReadOnlyList<ProgramStepDto>>> GetSteps(
        string id,
        CancellationToken ct)
    {
        var entity = await _db.Programs.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, ct);
        if (entity is null)
            return NotFound("Program not found.");

        List<ProgramStepDto> steps;
        try
        {
            steps = JsonSerializer.Deserialize<List<ProgramStepDto>>(entity.ExercisesJson, StepJsonOptions) ?? [];
        }
        catch
        {
            return BadRequest("Program exercisesJson is invalid JSON.");
        }

        var clean = steps
            .Where(s =>
                !string.IsNullOrWhiteSpace(s.Id) &&
                !string.IsNullOrWhiteSpace(s.Name) &&
                !string.IsNullOrWhiteSpace(s.Description) &&
                s.DurationSec > 0)
            .ToList();

        return Ok(clean);
    }

    [HttpGet("{id}/steps/{stepId}")]
    public async Task<ActionResult<ProgramStepDto>> GetStepById(
        string id,
        string stepId,
        CancellationToken ct)
    {
        var entity = await _db.Programs.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, ct);
        if (entity is null)
            return NotFound("Program not found.");

        List<ProgramStepDto> steps;
        try
        {
            steps = JsonSerializer.Deserialize<List<ProgramStepDto>>(entity.ExercisesJson, StepJsonOptions) ?? [];
        }
        catch
        {
            return BadRequest("Program exercisesJson is invalid JSON.");
        }

        var step = steps.FirstOrDefault(s =>
            string.Equals(s.Id, stepId, StringComparison.OrdinalIgnoreCase));

        return step is null ? NotFound("Step not found.") : Ok(step);
    }

    [HttpPut("{id}/steps/{stepId}")]
    public async Task<IActionResult> UpdateStep(
        string id,
        string stepId,
        [FromBody] UpdateProgramStepRequest body,
        CancellationToken ct)
    {
        if (!TryValidateStepUpdateBody(body, out var validationError))
            return BadRequest(validationError);

        var entity = await _db.Programs.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (entity is null)
            return NotFound("Program not found.");

        List<ProgramStepDto> steps;
        try
        {
            steps = JsonSerializer.Deserialize<List<ProgramStepDto>>(entity.ExercisesJson, StepJsonOptions) ?? [];
        }
        catch
        {
            return BadRequest("Program exercisesJson is invalid JSON.");
        }

        var index = steps.FindIndex(s =>
            string.Equals(s.Id, stepId, StringComparison.OrdinalIgnoreCase));
        if (index < 0)
            return NotFound("Step not found.");

        var current = steps[index]!;
        var nextId = string.IsNullOrWhiteSpace(body.Id) ? current.Id : body.Id.Trim();
        if (!string.Equals(nextId, current.Id, StringComparison.OrdinalIgnoreCase) &&
            steps.Any(s => string.Equals(s.Id, nextId, StringComparison.OrdinalIgnoreCase)))
        {
            return Conflict($"Step with id '{nextId}' already exists.");
        }

        steps[index] = new ProgramStepDto(
            nextId,
            body.Name.Trim(),
            body.DurationSec,
            body.Description.Trim());

        entity.ExercisesJson = JsonSerializer.Serialize(steps, StepJsonOptions);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id}/steps/{stepId}")]
    public async Task<IActionResult> DeleteStep(
        string id,
        string stepId,
        CancellationToken ct)
    {
        var entity = await _db.Programs.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (entity is null)
            return NotFound("Program not found.");

        List<ProgramStepDto> steps;
        try
        {
            steps = JsonSerializer.Deserialize<List<ProgramStepDto>>(entity.ExercisesJson, StepJsonOptions) ?? [];
        }
        catch
        {
            return BadRequest("Program exercisesJson is invalid JSON.");
        }

        var removed = steps.RemoveAll(s =>
            string.Equals(s.Id, stepId, StringComparison.OrdinalIgnoreCase));
        if (removed == 0)
            return NoContent();

        entity.ExercisesJson = JsonSerializer.Serialize(steps, StepJsonOptions);
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

        if (body.DisplayOrder is < 0)
        {
            validationError = "DisplayOrder must be null or a non-negative integer.";
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

    private static ProgramDto ToProgramDto(Models.PilatesProgramEntity p) =>
        new(
            p.Id,
            p.Name,
            p.DurationWeeks,
            p.Level,
            p.ExercisesJson,
            ParseSteps(p.ExercisesJson),
            p.DisplayOrder);

    private static IReadOnlyList<ProgramStepDto> ParseSteps(string exercisesJson)
    {
        try
        {
            var steps = JsonSerializer.Deserialize<List<ProgramStepDto>>(exercisesJson, StepJsonOptions) ?? [];
            return steps
                .Where(s =>
                    !string.IsNullOrWhiteSpace(s.Id) &&
                    !string.IsNullOrWhiteSpace(s.Name) &&
                    !string.IsNullOrWhiteSpace(s.Description) &&
                    s.DurationSec > 0)
                .ToList();
        }
        catch
        {
            return [];
        }
    }

    private static bool TryValidateStepBody(
        AddProgramStepRequest body,
        out string validationError)
    {
        if (string.IsNullOrWhiteSpace(body.Name))
        {
            validationError = "Step name is required.";
            return false;
        }

        if (body.DurationSec <= 0 || body.DurationSec > 7200)
        {
            validationError = "DurationSec must be between 1 and 7200.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(body.Description))
        {
            validationError = "Step description is required.";
            return false;
        }

        validationError = string.Empty;
        return true;
    }

    private static bool TryValidateStepUpdateBody(
        UpdateProgramStepRequest body,
        out string validationError)
    {
        if (string.IsNullOrWhiteSpace(body.Name))
        {
            validationError = "Step name is required.";
            return false;
        }

        if (body.DurationSec <= 0 || body.DurationSec > 7200)
        {
            validationError = "DurationSec must be between 1 and 7200.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(body.Description))
        {
            validationError = "Step description is required.";
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
    string ExercisesJson,
    IReadOnlyList<ProgramStepDto> Steps,
    int DisplayOrder
);

public record UpsertProgramRequest(
    string? Id,
    string Name,
    int DurationWeeks,
    string Level,
    string ExercisesJson,
    int? DisplayOrder = null);

public record AddProgramStepRequest(
    string? Id,
    string Name,
    int DurationSec,
    string Description
);

public record ProgramStepDto(
    string Id,
    string Name,
    int DurationSec,
    string Description
);

public record UpdateProgramStepRequest(
    string? Id,
    string Name,
    int DurationSec,
    string Description
);
