namespace FitLifeAPI.DTOs.Requests;

public class CreateYogaStepRequest
{
    public int YogaClassId { get; set; }

    public string Title { get; set; } = string.Empty;

    public int DurationSec { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public int StepOrder { get; set; }
}