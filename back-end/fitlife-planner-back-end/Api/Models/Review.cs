using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class Review
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ReviewerId { get; set; }
    public Guid TargetUserId { get; set; } // User or coach being reviewed
    public int Rating { get; set; } // 1-5 stars
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
