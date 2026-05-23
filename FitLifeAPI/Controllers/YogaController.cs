using Microsoft.AspNetCore.Mvc;
using FitLifeAPI.Services.Interfaces;
using FitLifeAPI.DTOs.Requests;

namespace FitLifeAPI.Controllers;

[ApiController]
[Route("api/yoga")]
public class YogaController : ControllerBase
{
    private readonly IYogaService _service;

    public YogaController(IYogaService service)
    {
        _service = service;
    }

    [HttpGet("tasks")]
    public async Task<IActionResult> GetClasses()
    {
        var data = await _service.GetClasses();
        return Ok(new { tasks = data });
    }

    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions()
    {
        var data = await _service.GetSessions();
        return Ok(new { sessions = data });
    }

    [HttpPost("book")]
    public async Task<IActionResult> Book([FromBody] BookSessionRequest req)
    {
        await _service.BookSession(
            req.SessionId,
            req.UserName
        );

        return Ok(new { success = true });
    }

    [HttpGet("upcoming")]
    public async Task<IActionResult> GetUpcoming()
    {
        var data = await _service.GetUpcomingClasses();
        return Ok(new { upcoming = data });
    }

    [HttpGet("steps/{yogaClassId}")]
    public async Task<IActionResult> GetSteps(int yogaClassId)
    {
        var data = await _service.GetSteps(yogaClassId);
        return Ok(new { steps = data });
    }
}