namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class GetBmiResponseDto
{
    public Guid BmiRecordId { get; set; }
    public Guid ProfileId { get; set; }
    public double HeightCm { get; set; }
    public double WeightKg { get; set; }
    public double BMI { get; set; }
    public string Assessment { get; set; }
    public Dictionary<string, object>? Goal { get; set; }
    public string? PracticeLevel { get; set; }
    public double? ActivityFactor { get; set; }
    public bool IsCurrent { get; set; }
    public bool IsComplete { get; set; }
    public DateTime RecordedAt { get; set; }
}
