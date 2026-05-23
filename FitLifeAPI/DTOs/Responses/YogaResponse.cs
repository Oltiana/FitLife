namespace FitLifeAPI.DTOs.Responses;

public class YogaResponse
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Level { get; set; } = string.Empty;

    public int DurationMin { get; set; }

    public string ImageUrl { get; set; } = string.Empty;
}