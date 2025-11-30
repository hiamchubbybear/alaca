using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class ChallengeParticipant
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ChallengeId { get; set; }
    public Guid UserId { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "active"; // active, completed, failed, withdrawn
    public string? Progress { get; set; } // JSON
    public string? FinalResult { get; set; } // JSON
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Challenge? Challenge { get; set; }
}
