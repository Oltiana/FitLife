namespace FitLife.Api.Models;

public class PilatesWeightEntryEntity
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public DateTime LoggedAt { get; set; }
    public decimal Kg { get; set; }
}
