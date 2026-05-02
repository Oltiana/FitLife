namespace FitLifeAPI.DTOs.Responses
{
    public class UserPilatesProgressResponse
    {
        public int PilatesProgramId { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        public int TotalWorkouts { get; set; }
        public int CompletedWorkouts { get; set; }
        public int ProgressPercent { get; set; }
        public DateTime EnrolledAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}