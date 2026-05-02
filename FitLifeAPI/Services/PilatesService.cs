using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.DTOs.Responses;
using FitLifeAPI.Models.Entities;
using FitLifeAPI.Repositories.Interfaces;
using FitLifeAPI.Services.Interfaces;

namespace FitLifeAPI.Services
{
    public class PilatesService : IPilatesService
    {
        private readonly IPilatesRepository _pilatesRepository;

        public PilatesService(IPilatesRepository pilatesRepository)
        {
            _pilatesRepository = pilatesRepository;
        }

        public async Task<IEnumerable<PilatesProgramResponse>> GetAllProgramsAsync(int userId)
        {
            var programs = await _pilatesRepository.GetAllProgramsAsync();
            var enrollments = await _pilatesRepository.GetUserEnrollmentsAsync(userId);
            var enrolledIds = enrollments.Select(e => e.PilatesProgramId).ToHashSet();

            return programs.Select(p => MapToResponse(p, userId, enrolledIds));
        }

        public async Task<PilatesProgramResponse?> GetProgramByIdAsync(int id, int userId)
        {
            var program = await _pilatesRepository.GetProgramByIdAsync(id);
            if (program == null) return null;

            var progress = await _pilatesRepository.GetUserProgressAsync(userId, id);
            var completedIds = progress.Where(p => p.IsCompleted).Select(p => p.PilatesWorkoutId).ToHashSet();

            return new PilatesProgramResponse
            {
                Id = program.Id,
                Name = program.Name,
                Description = program.Description,
                DurationWeeks = program.DurationWeeks,
                Level = program.Level,
                DisplayOrder = program.DisplayOrder,
                Workouts = program.Workouts.Select(w => new PilatesWorkoutResponse
                {
                    Id = w.Id,
                    Name = w.Name,
                    Description = w.Description,
                    DurationMinutes = w.DurationMinutes,
                    OrderIndex = w.OrderIndex,
                    IsCompleted = completedIds.Contains(w.Id)
                }).ToList()
            };
        }

        public async Task<UserPilatesProgressResponse> EnrollAsync(int userId, EnrollPilatesProgramRequest request)
        {
            var existing = await _pilatesRepository.GetEnrollmentAsync(userId, request.PilatesProgramId);
            if (existing != null)
                throw new Exception("Already enrolled in this program.");

            var enrollment = new UserPilatesEnrollment
            {
                UserId = userId,
                PilatesProgramId = request.PilatesProgramId
            };

            await _pilatesRepository.AddEnrollmentAsync(enrollment);

            var program = await _pilatesRepository.GetProgramByIdAsync(request.PilatesProgramId);

            return new UserPilatesProgressResponse
            {
                PilatesProgramId = request.PilatesProgramId,
                ProgramName = program!.Name,
                TotalWorkouts = program.Workouts.Count,
                CompletedWorkouts = 0,
                ProgressPercent = 0,
                EnrolledAt = enrollment.EnrolledAt
            };
        }

        public async Task<IEnumerable<UserPilatesProgressResponse>> GetMyEnrollmentsAsync(int userId)
        {
            var enrollments = await _pilatesRepository.GetUserEnrollmentsAsync(userId);
            var result = new List<UserPilatesProgressResponse>();

            foreach (var e in enrollments)
            {
                var progress = await _pilatesRepository.GetUserProgressAsync(userId, e.PilatesProgramId);
                var completed = progress.Count(p => p.IsCompleted);
                var total = e.Program.Workouts.Count;

                result.Add(new UserPilatesProgressResponse
                {
                    PilatesProgramId = e.PilatesProgramId,
                    ProgramName = e.Program.Name,
                    TotalWorkouts = total,
                    CompletedWorkouts = completed,
                    ProgressPercent = total == 0 ? 0 : (int)((double)completed / total * 100),
                    EnrolledAt = e.EnrolledAt,
                    CompletedAt = e.CompletedAt
                });
            }

            return result;
        }

        public async Task<UserPilatesProgressResponse?> CompleteWorkoutAsync(int userId, CompletePilatesWorkoutRequest request)
        {
            var existing = await _pilatesRepository.GetProgressAsync(userId, request.PilatesWorkoutId);

            if (existing == null)
            {
                var progress = new UserPilatesProgress
                {
                    UserId = userId,
                    PilatesWorkoutId = request.PilatesWorkoutId,
                    IsCompleted = true,
                    CompletedAt = DateTime.UtcNow
                };
                await _pilatesRepository.AddProgressAsync(progress);
            }
            else
            {
                existing.IsCompleted = true;
                existing.CompletedAt = DateTime.UtcNow;
                await _pilatesRepository.UpdateProgressAsync(existing);
            }

            var workout = await _pilatesRepository.GetWorkoutByIdAsync(request.PilatesWorkoutId);
            if (workout == null) return null;

            var allProgress = await _pilatesRepository.GetUserProgressAsync(userId, workout.PilatesProgramId);
            var program = await _pilatesRepository.GetProgramByIdAsync(workout.PilatesProgramId);
            var completed = allProgress.Count(p => p.IsCompleted);
            var total = program!.Workouts.Count;

            return new UserPilatesProgressResponse
            {
                PilatesProgramId = workout.PilatesProgramId,
                ProgramName = program.Name,
                TotalWorkouts = total,
                CompletedWorkouts = completed,
                ProgressPercent = total == 0 ? 0 : (int)((double)completed / total * 100),
                EnrolledAt = DateTime.UtcNow
            };
        }

        public async Task<PilatesProgramResponse> CreateProgramAsync(CreatePilatesProgramRequest request)
        {
            var program = new PilatesProgram
            {
                Name = request.Name,
                Description = request.Description,
                DurationWeeks = request.DurationWeeks,
                Level = request.Level,
                DisplayOrder = request.DisplayOrder
            };

            await _pilatesRepository.AddProgramAsync(program);

            return new PilatesProgramResponse
            {
                Id = program.Id,
                Name = program.Name,
                Description = program.Description,
                DurationWeeks = program.DurationWeeks,
                Level = program.Level,
                DisplayOrder = program.DisplayOrder,
                Workouts = new List<PilatesWorkoutResponse>()
            };
        }

        public async Task<PilatesWorkoutResponse> CreateWorkoutAsync(CreatePilatesWorkoutRequest request)
        {
            var workout = new PilatesWorkout
            {
                PilatesProgramId = request.PilatesProgramId,
                Name = request.Name,
                Description = request.Description,
                DurationMinutes = request.DurationMinutes,
                OrderIndex = request.OrderIndex
            };

            await _pilatesRepository.AddWorkoutAsync(workout);

            return new PilatesWorkoutResponse
            {
                Id = workout.Id,
                Name = workout.Name,
                Description = workout.Description,
                DurationMinutes = workout.DurationMinutes,
                OrderIndex = workout.OrderIndex,
                IsCompleted = false
            };
        }

        public async Task<PilatesWorkout?> GetWorkoutByIdAsync(int id)
        {
            return await _pilatesRepository.GetWorkoutByIdAsync(id);
        }

        private static PilatesProgramResponse MapToResponse(PilatesProgram p, int userId, HashSet<int> enrolledIds)
        {
            return new PilatesProgramResponse
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                DurationWeeks = p.DurationWeeks,
                Level = p.Level,
                DisplayOrder = p.DisplayOrder,
                Workouts = p.Workouts.Select(w => new PilatesWorkoutResponse
                {
                    Id = w.Id,
                    Name = w.Name,
                    Description = w.Description,
                    DurationMinutes = w.DurationMinutes,
                    OrderIndex = w.OrderIndex,
                    IsCompleted = false
                }).ToList()
            };
        }
    }
}