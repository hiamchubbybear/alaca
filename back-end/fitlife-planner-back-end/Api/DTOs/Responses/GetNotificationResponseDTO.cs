namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class GetNotificationResponseDTO
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public string Body { get; set; }
    public string? Type { get; set; }
    public string? Data { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }
}
