using FitLifeAPI.Models.Entities;

namespace FitLifeAPI.Repositories.Interfaces
{
    public interface IPilatesRepository
    {
        Task<IEnumerable<PilatesProgram>> GetAllProgramsAsync();
        Task<PilatesProgram?> GetProgramByIdAsync(int id);
        Task<PilatesWorkout?> GetWorkoutByIdAsync(int id);
        Task<UserPilatesEnrollment?> GetEnrollmentAsync(int userId, int programId);
        Task<IEnumerable<UserPilatesEnrollment>> GetUserEnrollmentsAsync(int userId);
        Task AddEnrollmentAsync(UserPilatesEnrollment enrollment);
        Task<bool> DeleteEnrollmentAsync(int userId, int programId);
        Task<IEnumerable<UserPilatesProgress>> GetUserCompletedProgressAsync(int userId);
        Task<UserPilatesProgress?> GetProgressAsync(int userId, int workoutId);
        Task<IEnumerable<UserPilatesProgress>> GetUserProgressAsync(int userId, int programId);
        Task AddProgressAsync(UserPilatesProgress progress);
        Task UpdateProgressAsync(UserPilatesProgress progress);
        Task AddProgramAsync(PilatesProgram program);
        Task AddWorkoutAsync(PilatesWorkout workout);
        Task<bool> UpdateProgramAsync(PilatesProgram program);
        Task<bool> DeleteProgramAsync(int id);
        Task<bool> UpdateWorkoutAsync(PilatesWorkout workout);
        Task<bool> DeleteWorkoutAsync(int id);
    }
}