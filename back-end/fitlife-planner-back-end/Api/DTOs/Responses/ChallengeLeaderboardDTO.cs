namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class ChallengeLeaderboardDTO
{
    public int Rank { get; set; }
    public Guid UserId { get; set; }
    public string Username { get; set; }
    public string? AvatarUrl { get; set; }
    public double Progress { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string Status { get; set; }
}
