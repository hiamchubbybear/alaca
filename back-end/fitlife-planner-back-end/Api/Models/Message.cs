using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class Message
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? ChannelId { get; set; }
    public Guid SenderId { get; set; }
    public string Content { get; set; }
    public string? ContentType { get; set; } // text, photo, video, file
    public string? Attachments { get; set; } // JSON
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
