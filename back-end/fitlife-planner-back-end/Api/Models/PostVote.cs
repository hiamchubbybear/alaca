using System.ComponentModel.DataAnnotations;
using fitlife_planner_back_end.Api.Enums;

namespace fitlife_planner_back_end.Api.Models;

public class PostVote
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PostId { get; set; }
    public Guid UserId { get; set; }
    public VoteType VoteType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Post? Post { get; set; }
}
