using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitLifeAPI.Data;

namespace FitLifeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalPilatesPrograms = await _context.PilatesPrograms.CountAsync();
            var totalYogaClasses = await _context.UpcomingClasses.CountAsync();
            var totalFitnessExercises = await _context.WorkoutPlans.CountAsync();

            return Ok(new
            {
                totalUsers,
                totalPilatesPrograms,
                totalYogaClasses,
                totalFitnessExercises,
            });
        }
    }
}