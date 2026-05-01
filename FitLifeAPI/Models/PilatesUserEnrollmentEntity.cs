namespace FitLife.Api.Models;

public class PilatesUserEnrollmentEntity
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string ProgramId { get; set; } = string.Empty;
    public DateTimeOffset EnrolledAt { get; set; }
}
