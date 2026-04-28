using Microsoft.EntityFrameworkCore;
using FitLifeAPI.Data;
using FitLifeAPI.Models.Entities;
using FitLifeAPI.Repositories.Interfaces;

namespace FitLifeAPI.Repositories
{
    public class FitnessRepository : IFitnessRepository
    {
        private readonly AppDbContext _context;

        public FitnessRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FavoriteExercise>> GetFavoriteExercisesAsync(int userId)
        {
            return await _context.FavoriteExercises
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<FavoriteExercise?> GetFavoriteExerciseByIdAsync(int id, int userId)
        {
            return await _context.FavoriteExercises
                .FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);
        }

        public async Task AddFavoriteExerciseAsync(FavoriteExercise favoriteExercise)
        {
            await _context.FavoriteExercises.AddAsync(favoriteExercise);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteFavoriteExerciseAsync(FavoriteExercise favoriteExercise)
        {
            _context.FavoriteExercises.Remove(favoriteExercise);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<WorkoutPlan>> GetWorkoutPlansAsync(int userId)
        {
            return await _context.WorkoutPlans
                .Include(wp => wp.WorkoutExercises)
                .Where(wp => wp.UserId == userId)
                .OrderByDescending(wp => wp.CreatedAt)
                .ToListAsync();
        }

        public async Task<WorkoutPlan?> GetWorkoutPlanByIdAsync(int id, int userId)
        {
            return await _context.WorkoutPlans
                .Include(wp => wp.WorkoutExercises)
                .FirstOrDefaultAsync(wp => wp.Id == id && wp.UserId == userId);
        }

        public async Task AddWorkoutPlanAsync(WorkoutPlan workoutPlan)
        {
            await _context.WorkoutPlans.AddAsync(workoutPlan);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateWorkoutPlanAsync(WorkoutPlan workoutPlan)
        {
            _context.WorkoutPlans.Update(workoutPlan);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteWorkoutPlanAsync(WorkoutPlan workoutPlan)
        {
            _context.WorkoutPlans.Remove(workoutPlan);
            await _context.SaveChangesAsync();
        }

        public async Task AddWorkoutExerciseAsync(WorkoutExercise workoutExercise)
        {
            await _context.WorkoutExercises.AddAsync(workoutExercise);
            await _context.SaveChangesAsync();
        }

        public async Task<WorkoutExercise?> GetWorkoutExerciseByIdAsync(int id)
        {
            return await _context.WorkoutExercises
                .Include(we => we.WorkoutPlan)
                .FirstOrDefaultAsync(we => we.Id == id);
        }

        public async Task DeleteWorkoutExerciseAsync(WorkoutExercise workoutExercise)
        {
            _context.WorkoutExercises.Remove(workoutExercise);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<WorkoutSession>> GetWorkoutSessionsAsync(int userId)
        {
            return await _context.WorkoutSessions
                .Include(ws => ws.WorkoutPlan)
                .Where(ws => ws.UserId == userId)
                .OrderByDescending(ws => ws.StartedAt)
                .ToListAsync();
        }

        public async Task<WorkoutSession?> GetWorkoutSessionByIdAsync(int id, int userId)
        {
            return await _context.WorkoutSessions
                .Include(ws => ws.WorkoutPlan)
                .FirstOrDefaultAsync(ws => ws.Id == id && ws.UserId == userId);
        }

        public async Task AddWorkoutSessionAsync(WorkoutSession workoutSession)
        {
            await _context.WorkoutSessions.AddAsync(workoutSession);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateWorkoutSessionAsync(WorkoutSession workoutSession)
        {
            _context.WorkoutSessions.Update(workoutSession);
            await _context.SaveChangesAsync();
        }
    }
}