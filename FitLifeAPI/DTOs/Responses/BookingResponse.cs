namespace FitLifeAPI.DTOs.Responses;

public class BookingResponse
{
    public int Id { get; set; }

    public int SessionId { get; set; }

    public string UserName { get; set; } = string.Empty;

    public DateTime BookingDate { get; set; }
}