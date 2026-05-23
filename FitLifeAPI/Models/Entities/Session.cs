namespace FitLifeAPI.Models.Entities;

public class Session
{
    public int Id { get; set; }

    public string StartTime { get; set; } = string.Empty;

    public int Capacity { get; set; }

    public string InstructorName { get; set; } = string.Empty;

    public int YogaClassId { get; set; }

    public DateTime SessionDate { get; set; }

    public YogaClass? YogaClass { get; set; }
}