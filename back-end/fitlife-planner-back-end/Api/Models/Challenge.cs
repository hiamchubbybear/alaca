using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class Challenge
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; }
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid CreatedBy { get; set; }
    public long? Strike { get; set; } // Number of days/streak to complete
    public string? Rules { get; set; } // JSON
    public string? Reward { get; set; } // JSON
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<ChallengeParticipant> Participants { get; set; } = new List<ChallengeParticipant>();
}
