namespace fitlife_planner_back_end.Api.DTOs.Requests
{
    public class CompleteWorkoutRequestDTO
    {
        public string WorkoutScheduleId { get; set; } = string.Empty;
        public DateTime CompletedAt { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateWorkoutScheduleRequestDTO
    {
        public string WorkoutId { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
    }
}
