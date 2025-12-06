namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class CreateNotificationRequestDTO
{
    public Guid UserId { get; set; }
    public string? Title { get; set; }
    public string Body { get; set; } = string.Empty;
    public string? Data { get; set; }
    public string? Type { get; set; } // challenge, workout, social, system
}
