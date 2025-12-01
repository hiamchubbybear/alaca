namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class FollowerResponseDTO
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid FollowerId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public DateTime FollowedAt { get; set; }
}

public class FollowerStatsDTO
{
    public int FollowersCount { get; set; }
    public int FollowingCount { get; set; }
    public bool IsFollowing { get; set; }
    public bool IsFollowedBy { get; set; }
}

public class FollowSuggestionDTO
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public int MutualFollowersCount { get; set; }
    public string SuggestionReason { get; set; } = string.Empty; // "Similar interests", "Popular in community", etc.
}
