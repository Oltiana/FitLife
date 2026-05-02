namespace FitLife.Api.Models;

public class PilatesProgramEntity
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int DurationWeeks { get; set; }
    public string Level { get; set; } = string.Empty;
    public string ExercisesJson { get; set; } = string.Empty;

    /** Renditja në lista (1 = i pari); jo alfabetik. */
    public int DisplayOrder { get; set; }
}
