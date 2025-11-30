namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class GetProgressEntryResponseDTO
{
    public Guid Id { get; set; }
    public string Type { get; set; }
    public DateTime RecordedAt { get; set; }
    public decimal? NumericValue { get; set; }
    public string? TextValue { get; set; }
    public string? PhotoUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}
