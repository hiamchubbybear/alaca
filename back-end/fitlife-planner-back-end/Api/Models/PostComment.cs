using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class PostComment
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PostId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Post? Post { get; set; }
}
