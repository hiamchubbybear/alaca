using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class UserAchievement
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid AchievementId { get; set; }
    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;
    public int Progress { get; set; } = 0; // For progressive achievements
    public bool IsNotified { get; set; } = false;

    // Navigation properties
    public User User { get; set; } = null!;
    public Achievement Achievement { get; set; } = null!;
}
