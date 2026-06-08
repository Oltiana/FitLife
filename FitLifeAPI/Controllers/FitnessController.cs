using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.Services.Interfaces;
using FitLifeAPI.DTOs.Responses;
using Microsoft.EntityFrameworkCore;
using FitLifeAPI.Data;


namespace FitLifeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FitnessController : ControllerBase
    {
        private readonly IFitnessService _fitnessService;
        private readonly IExerciseApiService _exerciseApiService;
        private readonly IActivityLogService _activityLogService;
        private readonly AppDbContext _context;

        public FitnessController(IFitnessService fitnessService, IExerciseApiService exerciseApiService, IActivityLogService activityLogService, AppDbContext context)
        {
            _fitnessService = fitnessService;
            _exerciseApiService = exerciseApiService;
            _activityLogService = activityLogService;
            _context = context;
        }

        private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

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
            await _activityLogService.LogAsync(userId, "CREATE", "WorkoutPlan", result.Id.ToString(), $"Created workout plan: {request.Name}", HttpContext.Connection.RemoteIpAddress?.ToString());
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
            await _activityLogService.LogAsync(userId, "DELETE", "WorkoutPlan", id.ToString(), $"Deleted workout plan #{id}", HttpContext.Connection.RemoteIpAddress?.ToString());
            return Ok("Workout plan deleted successfully");
        }

        [HttpPost("workout-plans/{workoutPlanId}/exercises")]
        public async Task<IActionResult> AddWorkoutExercise(int workoutPlanId, [FromBody] AddWorkoutExerciseRequest request)
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

        [HttpPut("workout-exercises/{id}")]
        public async Task<IActionResult> UpdateWorkoutExercise(int id, [FromBody] UpdateWorkoutExerciseRequest request)
        {
            var userId = GetUserId();
            var result = await _fitnessService.UpdateWorkoutExerciseAsync(id, userId, request);
            if (!result)
                return NotFound("Workout exercise not found");
            return Ok("Workout exercise updated successfully");
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
                await _activityLogService.LogAsync(userId, "START", "WorkoutSession", result.Id.ToString(), $"Started workout session for plan #{request.WorkoutPlanId}", HttpContext.Connection.RemoteIpAddress?.ToString());
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("workout-sessions/{id}/complete")]
        public async Task<IActionResult> CompleteWorkoutSession(int id, [FromBody] CompleteWorkoutSessionRequest request)
        {
            var userId = GetUserId();
            var result = await _fitnessService.CompleteWorkoutSessionAsync(id, userId, request);
            if (result == null)
                return NotFound("Workout session not found");
            await _activityLogService.LogAsync(userId, "COMPLETE", "WorkoutSession", id.ToString(), $"Completed workout session #{id}", HttpContext.Connection.RemoteIpAddress?.ToString());
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("exercises")]
        public async Task<IActionResult> GetExercises(
     [FromQuery] int offset = 0,
     [FromQuery] int limit = 80)
        {
            var exercises = await _context.FitnessExercises
                .OrderByDescending(e => e.CreatedAt)
                .Skip(offset)
                .Take(limit)
                .Select(e => new FitnessExerciseResponse
                {
                    Id = e.Id,
                    ExerciseName = e.ExerciseName,
                    BodyPart = e.BodyPart,
                    TargetMuscle = e.TargetMuscle,
                    Equipment = e.Equipment,
                    Level = e.Level,
                    GifUrl = e.GifUrl,
                    CreatedAt = e.CreatedAt
                })
                .ToListAsync();

            return Ok(exercises);
        }

        [AllowAnonymous]
        [HttpGet("exercises/{id:int}")]
        public async Task<IActionResult> GetExerciseById(int id)
        {
            var exercise = await _context.FitnessExercises
                .Where(e => e.Id == id)
                .Select(e => new FitnessExerciseResponse
                {
                    Id = e.Id,
                    ExerciseName = e.ExerciseName,
                    BodyPart = e.BodyPart,
                    TargetMuscle = e.TargetMuscle,
                    Equipment = e.Equipment,
                    Level = e.Level,
                    GifUrl = e.GifUrl,
                    CreatedAt = e.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (exercise == null)
                return NotFound("Exercise not found");

            return Ok(exercise);
        }
    }
}