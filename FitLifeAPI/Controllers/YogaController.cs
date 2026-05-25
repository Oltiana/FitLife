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

    [HttpGet("tasks/{id}")]
    public async Task<IActionResult> GetClassById(int id)
    {
        var data = await _service.GetClassById(id);

        if (data == null)
            return NotFound();

        return Ok(data);
    }

    [HttpPost("tasks")]
    public async Task<IActionResult> CreateClass(
        [FromBody] CreateYogaClassRequest req
    )
    {
        var created = await _service.CreateClass(req);

        return Ok(created);
    }

    [HttpPut("tasks/{id}")]
    public async Task<IActionResult> UpdateClass(
        int id,
        [FromBody] UpdateYogaClassRequest req
    )
    {
        await _service.UpdateClass(id, req);

        return NoContent();
    }

    [HttpDelete("tasks/{id}")]
    public async Task<IActionResult> DeleteClass(int id)
    {
        await _service.DeleteClass(id);

        return NoContent();
    }


    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions()
    {
        var data = await _service.GetSessions();

        return Ok(new { sessions = data });
    }

    [HttpPost("sessions")]
    public async Task<IActionResult> CreateSession(
        [FromBody] CreateYogaSessionRequest req
    )
    {
        var created = await _service.CreateSession(req);

        return Ok(created);
    }

    [HttpPut("sessions/{id}")]
    public async Task<IActionResult> UpdateSession(
        int id,
        [FromBody] UpdateYogaSessionRequest req
    )
    {
        await _service.UpdateSession(id, req);

        return NoContent();
    }

    [HttpDelete("sessions/{id}")]
    public async Task<IActionResult> DeleteSession(int id)
    {
        await _service.DeleteSession(id);

        return NoContent();
    }

    [HttpGet("bookings")]
    public async Task<IActionResult> GetBookings()
    {
        var data = await _service.GetBookings();

        return Ok(new
        {
            bookings = data
        });
    }

    [HttpPost("book")]
    public async Task<IActionResult> Book(
        [FromBody] BookSessionRequest req
    )
    {
        await _service.BookSession(
            req.SessionId,
            req.UserName
        );

        return Ok(new
        {
            success = true
        });
    }

    [HttpDelete("bookings/{id}")]
    public async Task<IActionResult> DeleteBooking(int id)
    {
        await _service.DeleteBooking(id);

        return NoContent();
    }


    [HttpGet("upcoming")]
    public async Task<IActionResult> GetUpcomingClasses()
    {
        var data = await _service.GetUpcomingClasses();

        return Ok(new
        {
            upcoming = data
        });
    }

    [HttpPost("upcoming")]
    public async Task<IActionResult> CreateUpcomingClass(
        [FromBody] CreateUpcomingClassRequest req
    )
    {
        var created = await _service.CreateUpcomingClass(req);

        return Ok(created);
    }

    [HttpPut("upcoming/{id}")]
    public async Task<IActionResult> UpdateUpcomingClass(
        int id,
        [FromBody] UpdateUpcomingClassRequest req
    )
    {
        await _service.UpdateUpcomingClass(id, req);

        return NoContent();
    }

    [HttpDelete("upcoming/{id}")]
    public async Task<IActionResult> DeleteUpcomingClass(int id)
    {
        await _service.DeleteUpcomingClass(id);

        return NoContent();
    }

    [HttpGet("steps/{yogaClassId}")]
    public async Task<IActionResult> GetSteps(int yogaClassId)
    {
        var data = await _service.GetSteps(yogaClassId);

        return Ok(new
        {
            steps = data
        });
    }

    [HttpPost("steps")]
    public async Task<IActionResult> CreateStep(
        [FromBody] CreateYogaStepRequest req
    )
    {
        var created = await _service.CreateStep(req);

        return Ok(created);
    }

    [HttpPut("steps/{id}")]
    public async Task<IActionResult> UpdateStep(
        int id,
        [FromBody] UpdateYogaStepRequest req
    )
    {
        await _service.UpdateStep(id, req);

        return NoContent();
    }

    [HttpDelete("steps/{id}")]
    public async Task<IActionResult> DeleteStep(int id)
    {
        await _service.DeleteStep(id);

        return NoContent();
    }
}