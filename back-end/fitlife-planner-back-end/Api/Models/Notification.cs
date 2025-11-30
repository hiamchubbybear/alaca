using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class Notification
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string? Title { get; set; }
    public string Body { get; set; }
    public string? Data { get; set; } // JSON metadata
    public string? Type { get; set; } // challenge, workout, social, system
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }
}
