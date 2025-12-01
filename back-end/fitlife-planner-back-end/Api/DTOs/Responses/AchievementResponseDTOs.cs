namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class AchievementResponseDTO
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string BadgeIcon { get; set; } = string.Empty;
    public int Points { get; set; }
    public string Tier { get; set; } = string.Empty;
    public bool IsUnlocked { get; set; }
    public DateTime? UnlockedAt { get; set; }
    public int Progress { get; set; }
}

public class StreakResponseDTO
{
    public string Type { get; set; } = string.Empty;
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime LastActivityDate { get; set; }
}

public class UserStatsResponseDTO
{
    public int TotalPoints { get; set; }
    public int AchievementsUnlocked { get; set; }
    public int TotalAchievements { get; set; }
    public List<StreakResponseDTO> Streaks { get; set; } = new();
    public List<AchievementResponseDTO> RecentAchievements { get; set; } = new();
}
