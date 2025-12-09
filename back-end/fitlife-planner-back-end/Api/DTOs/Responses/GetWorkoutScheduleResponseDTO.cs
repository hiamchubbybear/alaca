namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class GetWorkoutScheduleResponseDTO
{
    public Guid Id { get; set; }
    public Guid? WorkoutId { get; set; }  // Nullable for custom schedules
    public string WorkoutTitle { get; set; }
    public DateTime? ScheduledDate { get; set; }
    public TimeSpan? ScheduledTime { get; set; }
    public string Status { get; set; }
    public DateTime? CompletedAt { get; set; }
}
