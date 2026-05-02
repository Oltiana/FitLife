namespace FitLifeAPI.Models.Entities
{
    public class PilatesProgram
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationWeeks { get; set; }
        public string Level { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<PilatesWorkout> Workouts { get; set; } = new List<PilatesWorkout>();
        public ICollection<UserPilatesEnrollment> Enrollments { get; set; } = new List<UserPilatesEnrollment>();
    }
}