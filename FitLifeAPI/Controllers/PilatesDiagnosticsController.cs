using FitLife.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitLife.Api.Controllers;

/// <summary>
/// Verifikim i shpejtë: a po shkruhet në të njëjtën SQL Server database që sheh në SSMS?
/// Hape nga shfletuesi ose telefoni: GET /api/pilates/health/db
/// </summary>
[ApiController]
[Route("api/pilates/health")]
public class PilatesDiagnosticsController : ControllerBase
{
    private readonly PilatesFitLifeDbContext _db;

    public PilatesDiagnosticsController(PilatesFitLifeDbContext db)
    {
        _db = db;
    }

    [HttpGet("db")]
    public async Task<IActionResult> DatabaseInfo(CancellationToken ct)
    {
        await _db.Database.OpenConnectionAsync(ct);
        try
        {
            await using var cmd = _db.Database.GetDbConnection().CreateCommand();
            cmd.CommandText = """
                SELECT CAST(DB_NAME() AS nvarchar(128)),
                       CASE WHEN OBJECT_ID(N'dbo.PilatesWorkoutCompletions', N'U') IS NULL THEN -1
                            ELSE (SELECT COUNT(*) FROM dbo.PilatesWorkoutCompletions)
                       END
                """;
            await using var reader = await cmd.ExecuteReaderAsync(ct);
            if (!await reader.ReadAsync(ct))
                return StatusCode(500, new { error = "No row from DB_NAME() query" });

            var database = reader.GetString(0);
            var completionsCount = reader.GetInt32(1);
            return Ok(new PilatesDbHealthResponse(database, completionsCount));
        }
        finally
        {
            await _db.Database.CloseConnectionAsync();
        }
    }
}

public record PilatesDbHealthResponse(string Database, int CompletionsCount);
