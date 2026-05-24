using Microsoft.EntityFrameworkCore;
using FitLifeAPI.Data;
using FitLifeAPI.Models.Entities;
using FitLifeAPI.Repositories.Interfaces;

namespace FitLifeAPI.Repositories
{
    public class PilatesRepository : IPilatesRepository
    {
        private readonly AppDbContext _context;

        public PilatesRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PilatesProgram>> GetAllProgramsAsync()
        {
            return await _context.PilatesPrograms
                .Include(p => p.Workouts.OrderBy(w => w.OrderIndex))
                .OrderBy(p => p.DisplayOrder)
                .ToListAsync();
        }

        public async Task<PilatesProgram?> GetProgramByIdAsync(int id)
        {
            return await _context.PilatesPrograms
                .Include(p => p.Workouts.OrderBy(w => w.OrderIndex))
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<PilatesWorkout?> GetWorkoutByIdAsync(int id)
        {
            return await _context.PilatesWorkouts
                .Include(w => w.Program)
                .FirstOrDefaultAsync(w => w.Id == id);
        }

        public async Task<UserPilatesEnrollment?> GetEnrollmentAsync(int userId, int programId)
        {
            return await _context.UserPilatesEnrollments
                .FirstOrDefaultAsync(e => e.UserId == userId && e.PilatesProgramId == programId);
        }

        public async Task<IEnumerable<UserPilatesEnrollment>> GetUserEnrollmentsAsync(int userId)
        {
            return await _context.UserPilatesEnrollments
                .Include(e => e.Program)
                    .ThenInclude(p => p.Workouts)
                .Where(e => e.UserId == userId)
                .ToListAsync();
        }

        public async Task AddEnrollmentAsync(UserPilatesEnrollment enrollment)
        {
            await _context.UserPilatesEnrollments.AddAsync(enrollment);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteEnrollmentAsync(int userId, int programId)
        {
            var e = await GetEnrollmentAsync(userId, programId);
            if (e == null) return false;
            _context.UserPilatesEnrollments.Remove(e);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<UserPilatesProgress>> GetUserCompletedProgressAsync(int userId)
        {
            return await _context.UserPilatesProgresses
                .Include(p => p.Workout)
                    .ThenInclude(w => w.Program)
                .Where(p => p.UserId == userId && p.IsCompleted)
                .OrderByDescending(p => p.CompletedAt)
                .ToListAsync();
        }

        public async Task<UserPilatesProgress?> GetProgressAsync(int userId, int workoutId)
        {
            return await _context.UserPilatesProgresses
                .FirstOrDefaultAsync(p => p.UserId == userId && p.PilatesWorkoutId == workoutId);
        }

        public async Task<IEnumerable<UserPilatesProgress>> GetUserProgressAsync(int userId, int programId)
        {
            return await _context.UserPilatesProgresses
                .Include(p => p.Workout)
                .Where(p => p.UserId == userId && p.Workout.PilatesProgramId == programId)
                .ToListAsync();
        }

        public async Task AddProgressAsync(UserPilatesProgress progress)
        {
            await _context.UserPilatesProgresses.AddAsync(progress);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateProgressAsync(UserPilatesProgress progress)
        {
            _context.UserPilatesProgresses.Update(progress);
            await _context.SaveChangesAsync();
        }

        public async Task AddProgramAsync(PilatesProgram program)
        {
            await _context.PilatesPrograms.AddAsync(program);
            await _context.SaveChangesAsync();
        }

        public async Task AddWorkoutAsync(PilatesWorkout workout)
        {
            await _context.PilatesWorkouts.AddAsync(workout);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UpdateProgramAsync(PilatesProgram program)
        {
            var existing = await _context.PilatesPrograms.FindAsync(program.Id);
            if (existing == null) return false;
            existing.Name = program.Name;
            existing.Description = program.Description;
            existing.DurationWeeks = program.DurationWeeks;
            existing.Level = program.Level;
            existing.DisplayOrder = program.DisplayOrder;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteProgramAsync(int id)
        {
            var program = await _context.PilatesPrograms.FindAsync(id);
            if (program == null) return false;
            _context.PilatesPrograms.Remove(program);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateWorkoutAsync(PilatesWorkout workout)
        {
            var existing = await _context.PilatesWorkouts.FindAsync(workout.Id);
            if (existing == null) return false;
            existing.Name = workout.Name;
            existing.Description = workout.Description;
            existing.DurationMinutes = workout.DurationMinutes;
            existing.OrderIndex = workout.OrderIndex;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteWorkoutAsync(int id)
        {
            var workout = await _context.PilatesWorkouts.FindAsync(id);
            if (workout == null) return false;
            _context.PilatesWorkouts.Remove(workout);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}