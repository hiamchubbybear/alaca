using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class UserFollower
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; } // User being followed
    public Guid FollowerId { get; set; } // User who is following
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public User Follower { get; set; } = null!;
}
