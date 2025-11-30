namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class CreateProgressEntryRequestDTO
{
    public string Type { get; set; } // weight, bmi, photo, measurements, notes
    public DateTime? RecordedAt { get; set; }
    public decimal? NumericValue { get; set; }
    public string? TextValue { get; set; }
    public string? PhotoUrl { get; set; }
}
