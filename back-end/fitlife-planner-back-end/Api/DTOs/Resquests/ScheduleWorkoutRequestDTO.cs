using System.Text.Json.Serialization;

namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class ScheduleWorkoutRequestDTO
{
    public Guid WorkoutId { get; set; }

    [JsonPropertyName("scheduledFor")]
    public DateTime ScheduledDate { get; set; }

    public TimeSpan? ScheduledTime { get; set; }

    public bool IsRecurring { get; set; }

    public string? RecurrencePattern { get; set; }
}
