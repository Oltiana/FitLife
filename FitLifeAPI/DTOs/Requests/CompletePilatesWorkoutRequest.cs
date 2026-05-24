namespace FitLifeAPI.DTOs.Requests
{
    public class CompletePilatesWorkoutRequest
    {
        public int PilatesWorkoutId { get; set; }
        public string? ProgramName { get; set; }
        public string? WorkoutName { get; set; }
        public List<string>? ExercisesCompleted { get; set; }
    }
}