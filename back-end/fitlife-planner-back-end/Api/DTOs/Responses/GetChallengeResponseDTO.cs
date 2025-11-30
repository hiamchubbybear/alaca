namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class GetChallengeResponseDTO
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid CreatedBy { get; set; }
    public long? Strike { get; set; }
    public string? Rules { get; set; }
    public string? Reward { get; set; }
    public int ParticipantCount { get; set; }
    public bool IsParticipating { get; set; }
    public DateTime CreatedAt { get; set; }
}
