namespace FitLifeAPI.DTOs.Requests;

public class UpdateUpcomingClassRequest
{
    public string Title { get; set; } = string.Empty;

    public string InstructorName { get; set; } = string.Empty;

    public string Level { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public string StartTime { get; set; } = string.Empty;

    public int YogaClassId { get; set; }
}