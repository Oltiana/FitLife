namespace FitLifeAPI.DTOs.Responses;

public class YogaStepResponse
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public int DurationSec { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public int StepOrder { get; set; }
}