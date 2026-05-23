namespace FitLifeAPI.DTOs.Requests;

public class BookSessionRequest
{
    public int SessionId { get; set; }
    public string UserName { get; set; } = string.Empty;
}