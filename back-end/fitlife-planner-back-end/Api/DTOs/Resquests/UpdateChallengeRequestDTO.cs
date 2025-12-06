namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class UpdateChallengeRequestDTO
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public long? Strike { get; set; }
    public string? Rules { get; set; }
    public string? Reward { get; set; }
}
