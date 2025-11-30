namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class ScheduleWorkoutRequestDTO
{
    public Guid WorkoutId { get; set; }
    public DateTime ScheduledDate { get; set; }
    public TimeSpan? ScheduledTime { get; set; }
}
