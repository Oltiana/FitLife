using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FitLifeAPI.Data;
using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.Services;
using FitLifeAPI.Services.Interfaces;

namespace FitLifeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PilatesController : ControllerBase
    {
        private readonly IPilatesService _pilatesService;
        private readonly AppDbContext _context;

        public PilatesController(IPilatesService pilatesService, AppDbContext context)
        {
            _pilatesService = pilatesService;
            _context = context;
        }

        [HttpGet("progress-content")]
        public async Task<IActionResult> GetProgressContent()
        {
            await PilatesProgressContentHelper.EnsureSeedAsync(_context);
            return Ok(await PilatesProgressContentHelper.GetContentAsync(_context));
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet("programs")]
        public async Task<IActionResult> GetAllPrograms()
        {
            var result = await _pilatesService.GetAllProgramsAsync(GetUserId());
            return Ok(result);
        }

        [HttpGet("programs/{id:int}")]
        public async Task<IActionResult> GetProgramById(int id)
        {
            var result = await _pilatesService.GetProgramByIdAsync(id, GetUserId());
            if (result == null) return NotFound("Program not found");
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

        [HttpPut("programs/{id:int}")]
        public async Task<IActionResult> UpdateProgram(int id, [FromBody] UpdatePilatesProgramRequest request)
        {
            var result = await _pilatesService.UpdateProgramAsync(id, request);
            if (result == null) return NotFound("Program not found");
            return Ok(result);
        }

        [HttpDelete("programs/{id:int}")]
        public async Task<IActionResult> DeleteProgram(int id)
        {
            var ok = await _pilatesService.DeleteProgramAsync(id);
            if (!ok) return NotFound("Program not found");
            return NoContent();
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

        [HttpPut("workouts/{id:int}")]
        public async Task<IActionResult> UpdateWorkout(int id, [FromBody] UpdatePilatesWorkoutRequest request)
        {
            var result = await _pilatesService.UpdateWorkoutAsync(id, request);
            if (result == null) return NotFound("Workout not found");
            return Ok(result);
        }

        [HttpDelete("workouts/{id:int}")]
        public async Task<IActionResult> DeleteWorkout(int id)
        {
            var ok = await _pilatesService.DeleteWorkoutAsync(id);
            if (!ok) return NotFound("Workout not found");
            return NoContent();
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

        [HttpDelete("my-enrollments/{pilatesProgramId:int}")]
        public async Task<IActionResult> Unenroll(int pilatesProgramId)
        {
            var ok = await _pilatesService.UnenrollAsync(GetUserId(), pilatesProgramId);
            if (!ok) return NotFound("Enrollment not found");
            return NoContent();
        }

        [HttpGet("my-workout-progress")]
        public async Task<IActionResult> GetMyCompletedWorkouts()
        {
            var list = await _pilatesService.GetMyCompletedWorkoutsAsync(GetUserId());
            return Ok(list);
        }

        [HttpPost("complete-workout")]
        public async Task<IActionResult> CompleteWorkout([FromBody] CompletePilatesWorkoutRequest request)
        {
            var result = await _pilatesService.CompleteWorkoutAsync(GetUserId(), request);
            if (result == null) return NotFound("Workout not found");
            return Ok(result);
        }
    }
}

