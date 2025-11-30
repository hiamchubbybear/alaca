using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class UserSettings
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string? Preferences { get; set; } // JSON - theme, language, units, etc.
    public string? NotificationPrefs { get; set; } // JSON - email, push, in-app preferences
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
