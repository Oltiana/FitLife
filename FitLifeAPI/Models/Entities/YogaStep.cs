namespace FitLifeAPI.Models.Entities;

public class YogaStep
{
    public int Id { get; set; }

    public int YogaClassId { get; set; }

    public string Title { get; set; } = string.Empty;

    public int DurationSec { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public int StepOrder { get; set; }

    public YogaClass? YogaClass { get; set; }
}