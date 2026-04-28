using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.DTOs.Responses;
using FitLifeAPI.Models.Entities;
using FitLifeAPI.Repositories.Interfaces;
using FitLifeAPI.Services.Interfaces;

namespace FitLifeAPI.Services
{
    public class FitnessService : IFitnessService
    {
        private readonly IFitnessRepository _fitnessRepository;

        public FitnessService(IFitnessRepository fitnessRepository)
        {
            _fitnessRepository = fitnessRepository;
        }

        public async Task<IEnumerable<FavoriteExerciseResponse>> GetFavoriteExercisesAsync(int userId)
        {
            var favorites = await _fitnessRepository.GetFavoriteExercisesAsync(userId);

            return favorites.Select(f => new FavoriteExerciseResponse
            {
                Id = f.Id,
                ExternalExerciseId = f.ExternalExerciseId,
                ExerciseName = f.ExerciseName,
                BodyPart = f.BodyPart,
                TargetMuscle = f.TargetMuscle,
                Equipment = f.Equipment,
                GifUrl = f.GifUrl,
                CreatedAt = f.CreatedAt
            });
        }

        public async Task<FavoriteExerciseResponse> AddFavoriteExerciseAsync(int userId, CreateFavoriteExerciseRequest request)
        {
            var favorite = new FavoriteExercise
            {
                UserId = userId,
                ExternalExerciseId = request.ExternalExerciseId,
                ExerciseName = request.ExerciseName,
                BodyPart = request.BodyPart,
                TargetMuscle = request.TargetMuscle,
                Equipment = request.Equipment,
                GifUrl = request.GifUrl
            };

            await _fitnessRepository.AddFavoriteExerciseAsync(favorite);

            return new FavoriteExerciseResponse
            {
                Id = favorite.Id,
                ExternalExerciseId = favorite.ExternalExerciseId,
                ExerciseName = favorite.ExerciseName,
                BodyPart = favorite.BodyPart,
                TargetMuscle = favorite.TargetMuscle,
                Equipment = favorite.Equipment,
                GifUrl = favorite.GifUrl,
                CreatedAt = favorite.CreatedAt
            };
        }

        public async Task<bool> DeleteFavoriteExerciseAsync(int id, int userId)
        {
            var favorite = await _fitnessRepository.GetFavoriteExerciseByIdAsync(id, userId);
            if (favorite == null)
                return false;

            await _fitnessRepository.DeleteFavoriteExerciseAsync(favorite);
            return true;
        }

        public async Task<IEnumerable<WorkoutPlanResponse>> GetWorkoutPlansAsync(int userId)
        {
            var plans = await _fitnessRepository.GetWorkoutPlansAsync(userId);

            return plans.Select(MapWorkoutPlanToResponse);
        }

        public async Task<WorkoutPlanResponse> CreateWorkoutPlanAsync(int userId, CreateWorkoutPlanRequest request)
        {
            var plan = new WorkoutPlan
            {
                UserId = userId,
                Name = request.Name,
                Description = request.Description,
                Level = request.Level
            };

            await _fitnessRepository.AddWorkoutPlanAsync(plan);

            return MapWorkoutPlanToResponse(plan);
        }

        public async Task<WorkoutPlanResponse?> GetWorkoutPlanByIdAsync(int id, int userId)
        {
            var plan = await _fitnessRepository.GetWorkoutPlanByIdAsync(id, userId);
            if (plan == null)
                return null;

            return MapWorkoutPlanToResponse(plan);
        }

        public async Task<bool> DeleteWorkoutPlanAsync(int id, int userId)
        {
            var plan = await _fitnessRepository.GetWorkoutPlanByIdAsync(id, userId);
            if (plan == null)
                return false;

            await _fitnessRepository.DeleteWorkoutPlanAsync(plan);
            return true;
        }

        public async Task<WorkoutExerciseResponse> AddWorkoutExerciseAsync(int workoutPlanId, int userId, AddWorkoutExerciseRequest request)
        {
            var plan = await _fitnessRepository.GetWorkoutPlanByIdAsync(workoutPlanId, userId);
            if (plan == null)
                throw new Exception("Workout plan not found");

            var workoutExercise = new WorkoutExercise
            {
                WorkoutPlanId = workoutPlanId,
                ExternalExerciseId = request.ExternalExerciseId,
                ExerciseName = request.ExerciseName,
                BodyPart = request.BodyPart,
                TargetMuscle = request.TargetMuscle,
                GifUrl = request.GifUrl,
                Sets = request.Sets,
                Reps = request.Reps,
                OrderIndex = request.OrderIndex
            };

            await _fitnessRepository.AddWorkoutExerciseAsync(workoutExercise);

            return MapWorkoutExerciseToResponse(workoutExercise);
        }

        public async Task<bool> DeleteWorkoutExerciseAsync(int id, int userId)
        {
            var workoutExercise = await _fitnessRepository.GetWorkoutExerciseByIdAsync(id);

            if (workoutExercise == null || workoutExercise.WorkoutPlan.UserId != userId)
                return false;

            await _fitnessRepository.DeleteWorkoutExerciseAsync(workoutExercise);
            return true;
        }

        public async Task<IEnumerable<WorkoutSessionResponse>> GetWorkoutSessionsAsync(int userId)
        {
            var sessions = await _fitnessRepository.GetWorkoutSessionsAsync(userId);

            return sessions.Select(MapWorkoutSessionToResponse);
        }

        public async Task<WorkoutSessionResponse> StartWorkoutSessionAsync(int userId, CreateWorkoutSessionRequest request)
        {
            var plan = await _fitnessRepository.GetWorkoutPlanByIdAsync(request.WorkoutPlanId, userId);
            if (plan == null)
                throw new Exception("Workout plan not found");

            var session = new WorkoutSession
            {
                UserId = userId,
                WorkoutPlanId = request.WorkoutPlanId,
                StartedAt = DateTime.UtcNow,
                Completed = false
            };

            await _fitnessRepository.AddWorkoutSessionAsync(session);

            return MapWorkoutSessionToResponse(session);
        }

        public async Task<WorkoutSessionResponse?> CompleteWorkoutSessionAsync(int id, int userId, CompleteWorkoutSessionRequest request)
        {
            var session = await _fitnessRepository.GetWorkoutSessionByIdAsync(id, userId);
            if (session == null)
                return null;

            session.Completed = true;
            session.CompletedAt = DateTime.UtcNow;
            session.DurationMinutes = request.DurationMinutes;
            session.Calories = request.Calories;

            await _fitnessRepository.UpdateWorkoutSessionAsync(session);

            return MapWorkoutSessionToResponse(session);
        }

        private static WorkoutPlanResponse MapWorkoutPlanToResponse(WorkoutPlan plan)
        {
            return new WorkoutPlanResponse
            {
                Id = plan.Id,
                Name = plan.Name,
                Description = plan.Description,
                Level = plan.Level,
                CreatedAt = plan.CreatedAt,
                Exercises = plan.WorkoutExercises
                    .OrderBy(e => e.OrderIndex)
                    .Select(MapWorkoutExerciseToResponse)
                    .ToList()
            };
        }

        private static WorkoutExerciseResponse MapWorkoutExerciseToResponse(WorkoutExercise exercise)
        {
            return new WorkoutExerciseResponse
            {
                Id = exercise.Id,
                ExternalExerciseId = exercise.ExternalExerciseId,
                ExerciseName = exercise.ExerciseName,
                BodyPart = exercise.BodyPart,
                TargetMuscle = exercise.TargetMuscle,
                GifUrl = exercise.GifUrl,
                Sets = exercise.Sets,
                Reps = exercise.Reps,
                OrderIndex = exercise.OrderIndex
            };
        }

        private static WorkoutSessionResponse MapWorkoutSessionToResponse(WorkoutSession session)
        {
            return new WorkoutSessionResponse
            {
                Id = session.Id,
                WorkoutPlanId = session.WorkoutPlanId,
                StartedAt = session.StartedAt,
                CompletedAt = session.CompletedAt,
                DurationMinutes = session.DurationMinutes,
                Calories = session.Calories,
                Completed = session.Completed
            };
        }
    }
}