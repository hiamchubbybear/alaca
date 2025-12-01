using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class Achievement
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // workout, nutrition, progress, social, challenge
    public string BadgeIcon { get; set; } = string.Empty; // emoji
    public int Points { get; set; }
    public string Criteria { get; set; } = "{}"; // JSON criteria
    public string Tier { get; set; } = "bronze"; // bronze, silver, gold, platinum
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
