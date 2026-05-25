namespace FitLifeAPI.DTOs.Requests;

public class CreateYogaSessionRequest
{
    public int YogaClassId { get; set; }

    public string StartTime { get; set; } = string.Empty;

    public int Capacity { get; set; }

    public string Instructor { get; set; } = string.Empty;

    public DateTime SessionDate { get; set; }
}