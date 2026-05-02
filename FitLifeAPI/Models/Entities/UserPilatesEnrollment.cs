namespace FitLifeAPI.Models.Entities
{
    public class UserPilatesEnrollment
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int PilatesProgramId { get; set; }
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        public User User { get; set; } = null!;
        public PilatesProgram Program { get; set; } = null!;
    }
}