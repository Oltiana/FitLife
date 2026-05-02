using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.Services.Interfaces;

namespace FitLifeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PilatesController : ControllerBase
    {
        private readonly IPilatesService _pilatesService;

        public PilatesController(IPilatesService pilatesService)
        {
            _pilatesService = pilatesService;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet("programs")]
        public async Task<IActionResult> GetAllPrograms()
        {
            var result = await _pilatesService.GetAllProgramsAsync(GetUserId());
            return Ok(result);
        }

        [HttpGet("programs/{id}")]
        public async Task<IActionResult> GetProgramById(int id)
        {
            var result = await _pilatesService.GetProgramByIdAsync(id, GetUserId());
            if (result == null) return NotFound("Program not found");
            return Ok(result);
        }

        [HttpPost("enroll")]
        public async Task<IActionResult> Enroll([FromBody] EnrollPilatesProgramRequest request)
        {
            try
            {
                var result = await _pilatesService.EnrollAsync(GetUserId(), request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("my-enrollments")]
        public async Task<IActionResult> GetMyEnrollments()
        {
            var result = await _pilatesService.GetMyEnrollmentsAsync(GetUserId());
            return Ok(result);
        }

        [HttpPost("complete-workout")]
        public async Task<IActionResult> CompleteWorkout([FromBody] CompletePilatesWorkoutRequest request)
        {
            var result = await _pilatesService.CompleteWorkoutAsync(GetUserId(), request);
            if (result == null) return NotFound("Workout not found");
            return Ok(result);
        }
        [HttpPost("programs")]
public async Task<IActionResult> CreateProgram([FromBody] CreatePilatesProgramRequest request)
{
    try
    {
        var result = await _pilatesService.CreateProgramAsync(request);
        return Ok(result);
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }
}

[HttpPost("workouts")]
public async Task<IActionResult> CreateWorkout([FromBody] CreatePilatesWorkoutRequest request)
{
    try
    {
        var result = await _pilatesService.CreateWorkoutAsync(request);
        return Ok(result);
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }
}
    }
}