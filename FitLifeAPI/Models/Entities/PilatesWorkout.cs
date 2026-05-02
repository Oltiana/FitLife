namespace FitLifeAPI.Models.Entities
{
    public class PilatesWorkout
    {
        public int Id { get; set; }
        public int PilatesProgramId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public int OrderIndex { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public PilatesProgram Program { get; set; } = null!;
        public ICollection<UserPilatesProgress> Progresses { get; set; } = new List<UserPilatesProgress>();
    }
}