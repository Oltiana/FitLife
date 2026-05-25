namespace FitLifeAPI.DTOs.Requests;

public class CreateYogaClassRequest
{
    public string Title { get; set; } = "";
    public string Level { get; set; } = "";
    public int DurationMin { get; set; }
    public string ImageUrl { get; set; } = "";
}