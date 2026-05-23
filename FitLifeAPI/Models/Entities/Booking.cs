namespace FitLifeAPI.Models.Entities;

public class Booking
{
    public int Id { get; set; }

    public int SessionId { get; set; }

    public string UserName { get; set; } = string.Empty;

    public DateTime BookingDate { get; set; } = DateTime.UtcNow;

    public Session? Session { get; set; }
}