using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class ProgressEntry
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Type { get; set; } // weight, bmi, photo, measurements, notes
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    public decimal? NumericValue { get; set; }
    public string? TextValue { get; set; }
    public string? PhotoUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
