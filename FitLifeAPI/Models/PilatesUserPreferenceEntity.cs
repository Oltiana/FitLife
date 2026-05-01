namespace FitLife.Api.Models;

public class PilatesUserPreferenceEntity
{
    public string UserId { get; set; } = string.Empty;
    public bool OnboardingComplete { get; set; }
    public int? DailyCalorieTarget { get; set; }
    public int? DailyMinutesTarget { get; set; }
}
