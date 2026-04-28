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
    public class FitnessController : ControllerBase
    {
        private readonly IFitnessService _fitnessService;

        public FitnessController(IFitnessService fitnessService)
        {
            _fitnessService = fitnessService;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        }

        [HttpGet("favorites")]
        public async Task<IActionResult> GetFavoriteExercises()
        {
            var userId = GetUserId();
            var result = await _fitnessService.GetFavoriteExercisesAsync(userId);
            return Ok(result);
        }

        [HttpPost("favorites")]
        public async Task<IActionResult> AddFavoriteExercise([FromBody] CreateFavoriteExerciseRequest request)
        {
            var userId = GetUserId();
            var result = await _fitnessService.AddFavoriteExerciseAsync(userId, request);
            return Ok(result);
        }

        [HttpDelete("favorites/{id}")]
        public async Task<IActionResult> DeleteFavoriteExercise(int id)
        {
            var userId = GetUserId();
            var result = await _fitnessService.DeleteFavoriteExerciseAsync(id, userId);

            if (!result)
                return NotFound("Favorite exercise not found");

            return Ok("Favorite exercise deleted successfully");
        }

        [HttpGet("workout-plans")]
        public async Task<IActionResult> GetWorkoutPlans()
        {
            var userId = GetUserId();
            var result = await _fitnessService.GetWorkoutPlansAsync(userId);
            return Ok(result);
        }

        [HttpPost("workout-plans")]
        public async Task<IActionResult> CreateWorkoutPlan([FromBody] CreateWorkoutPlanRequest request)
        {
            var userId = GetUserId();
            var result = await _fitnessService.CreateWorkoutPlanAsync(userId, request);
            return Ok(result);
        }

        [HttpGet("workout-plans/{id}")]
        public async Task<IActionResult> GetWorkoutPlanById(int id)
        {
            var userId = GetUserId();
            var result = await _fitnessService.GetWorkoutPlanByIdAsync(id, userId);

            if (result == null)
                return NotFound("Workout plan not found");

            return Ok(result);
        }

        [HttpDelete("workout-plans/{id}")]
        public async Task<IActionResult> DeleteWorkoutPlan(int id)
        {
            var userId = GetUserId();
            var result = await _fitnessService.DeleteWorkoutPlanAsync(id, userId);

            if (!result)
                return NotFound("Workout plan not found");

            return Ok("Workout plan deleted successfully");
        }

        [HttpPost("workout-plans/{workoutPlanId}/exercises")]
        public async Task<IActionResult> AddWorkoutExercise(
            int workoutPlanId,
            [FromBody] AddWorkoutExerciseRequest request)
        {
            var userId = GetUserId();

            try
            {
                var result = await _fitnessService.AddWorkoutExerciseAsync(workoutPlanId, userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("workout-exercises/{id}")]
        public async Task<IActionResult> DeleteWorkoutExercise(int id)
        {
            var userId = GetUserId();
            var result = await _fitnessService.DeleteWorkoutExerciseAsync(id, userId);

            if (!result)
                return NotFound("Workout exercise not found");

            return Ok("Workout exercise deleted successfully");
        }

        [HttpGet("workout-sessions")]
        public async Task<IActionResult> GetWorkoutSessions()
        {
            var userId = GetUserId();
            var result = await _fitnessService.GetWorkoutSessionsAsync(userId);
            return Ok(result);
        }

        [HttpPost("workout-sessions/start")]
        public async Task<IActionResult> StartWorkoutSession([FromBody] CreateWorkoutSessionRequest request)
        {
            var userId = GetUserId();

            try
            {
                var result = await _fitnessService.StartWorkoutSessionAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("workout-sessions/{id}/complete")]
        public async Task<IActionResult> CompleteWorkoutSession(
            int id,
            [FromBody] CompleteWorkoutSessionRequest request)
        {
            var userId = GetUserId();
            var result = await _fitnessService.CompleteWorkoutSessionAsync(id, userId, request);

            if (result == null)
                return NotFound("Workout session not found");

            return Ok(result);
        }
    }
}