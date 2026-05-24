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
            var result = new List<PilatesProgramResponse>();
            foreach (var p in programs)
            {
                var progress = await _pilatesRepository.GetUserProgressAsync(userId, p.Id);
                var completedIds = progress.Where(x => x.IsCompleted).Select(x => x.PilatesWorkoutId).ToHashSet();
                result.Add(MapToResponse(p, completedIds));
            }
            return result;
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
                    PilatesProgramId = w.PilatesProgramId,
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

        public async Task<bool> UnenrollAsync(int userId, int programId)
        {
            return await _pilatesRepository.DeleteEnrollmentAsync(userId, programId);
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
            var workout = await _pilatesRepository.GetWorkoutByIdAsync(request.PilatesWorkoutId);
            var snapshot = BuildProgressSnapshot(request, workout);

            var existing = await _pilatesRepository.GetProgressAsync(userId, request.PilatesWorkoutId);

            if (existing == null)
            {
                var progress = new UserPilatesProgress
                {
                    UserId = userId,
                    PilatesWorkoutId = request.PilatesWorkoutId,
                    IsCompleted = true,
                    CompletedAt = DateTime.UtcNow,
                    ProgramName = snapshot.ProgramName,
                    WorkoutName = snapshot.WorkoutName,
                    ExercisesCompleted = snapshot.ExercisesCompleted,
                };
                await _pilatesRepository.AddProgressAsync(progress);
            }
            else
            {
                existing.IsCompleted = true;
                existing.CompletedAt = DateTime.UtcNow;
                existing.ProgramName = snapshot.ProgramName;
                existing.WorkoutName = snapshot.WorkoutName;
                existing.ExercisesCompleted = snapshot.ExercisesCompleted;
                await _pilatesRepository.UpdateProgressAsync(existing);
            }

            if (workout == null)
                workout = await _pilatesRepository.GetWorkoutByIdAsync(request.PilatesWorkoutId);
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
                PilatesProgramId = workout.PilatesProgramId,
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

        public async Task<PilatesProgramResponse?> UpdateProgramAsync(int id, UpdatePilatesProgramRequest request)
        {
            var program = await _pilatesRepository.GetProgramByIdAsync(id);
            if (program == null) return null;

            program.Name = request.Name.Trim();
            program.Description = request.Description.Trim();
            program.DurationWeeks = request.DurationWeeks;
            program.Level = request.Level.Trim();
            program.DisplayOrder = request.DisplayOrder;

            var ok = await _pilatesRepository.UpdateProgramAsync(program);
            if (!ok) return null;

            var refreshed = await _pilatesRepository.GetProgramByIdAsync(id);
            if (refreshed == null) return null;
            return MapToResponse(refreshed, new HashSet<int>());
        }

        public async Task<bool> DeleteProgramAsync(int id)
        {
            return await _pilatesRepository.DeleteProgramAsync(id);
        }

        public async Task<PilatesWorkoutResponse?> UpdateWorkoutAsync(int id, UpdatePilatesWorkoutRequest request)
        {
            var workout = await _pilatesRepository.GetWorkoutByIdAsync(id);
            if (workout == null) return null;

            workout.Name = request.Name.Trim();
            workout.Description = request.Description.Trim();
            workout.DurationMinutes = request.DurationMinutes;
            workout.OrderIndex = request.OrderIndex;

            var ok = await _pilatesRepository.UpdateWorkoutAsync(workout);
            if (!ok) return null;

            var refreshed = await _pilatesRepository.GetWorkoutByIdAsync(id);
            if (refreshed == null) return null;

            return new PilatesWorkoutResponse
            {
                Id = refreshed.Id,
                PilatesProgramId = refreshed.PilatesProgramId,
                Name = refreshed.Name,
                Description = refreshed.Description,
                DurationMinutes = refreshed.DurationMinutes,
                OrderIndex = refreshed.OrderIndex,
                IsCompleted = false,
            };
        }

        public async Task<bool> DeleteWorkoutAsync(int id)
        {
            return await _pilatesRepository.DeleteWorkoutAsync(id);
        }

        public async Task<IReadOnlyList<UserPilatesWorkoutProgressResponse>> GetMyCompletedWorkoutsAsync(int userId)
        {
            var rows = await _pilatesRepository.GetUserCompletedProgressAsync(userId);
            return rows.Select(p => new UserPilatesWorkoutProgressResponse
            {
                Id = p.Id,
                PilatesWorkoutId = p.PilatesWorkoutId,
                PilatesProgramId = p.Workout.PilatesProgramId,
                ProgramName = ResolveProgramName(p),
                WorkoutName = ResolveWorkoutName(p),
                ExercisesCompleted = p.ExercisesCompleted,
                IsCompleted = p.IsCompleted,
                CompletedAt = p.CompletedAt,
                DurationMinutes = p.Workout.DurationMinutes,
            }).ToList();
        }

        private static (string ProgramName, string WorkoutName, string ExercisesCompleted) BuildProgressSnapshot(
            CompletePilatesWorkoutRequest request,
            PilatesWorkout? workout)
        {
            var programName = string.IsNullOrWhiteSpace(request.ProgramName)
                ? workout?.Program?.Name ?? string.Empty
                : request.ProgramName.Trim();
            var workoutName = string.IsNullOrWhiteSpace(request.WorkoutName)
                ? workout?.Name ?? string.Empty
                : request.WorkoutName.Trim();
            var exercises = FormatExercisesCompleted(request.ExercisesCompleted);
            return (programName, workoutName, exercises);
        }

        private static string FormatExercisesCompleted(IEnumerable<string>? items)
        {
            if (items == null) return string.Empty;
            var names = items
                .Select(s => s.Trim())
                .Where(s => s.Length > 0)
                .ToList();
            return names.Count == 0 ? string.Empty : string.Join(" • ", names);
        }

        private static string ResolveProgramName(UserPilatesProgress p)
        {
            if (!string.IsNullOrWhiteSpace(p.ProgramName)) return p.ProgramName;
            return p.Workout.Program?.Name ?? string.Empty;
        }

        private static string ResolveWorkoutName(UserPilatesProgress p)
        {
            if (!string.IsNullOrWhiteSpace(p.WorkoutName)) return p.WorkoutName;
            return p.Workout.Name;
        }

        private static PilatesProgramResponse MapToResponse(PilatesProgram p, HashSet<int> completedWorkoutIds)
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
                    PilatesProgramId = w.PilatesProgramId,
                    Name = w.Name,
                    Description = w.Description,
                    DurationMinutes = w.DurationMinutes,
                    OrderIndex = w.OrderIndex,
                    IsCompleted = completedWorkoutIds.Contains(w.Id),
                }).ToList()
            };
        }
    }
}