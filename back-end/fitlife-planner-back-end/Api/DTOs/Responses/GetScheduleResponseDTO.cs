namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class GetScheduleResponseDTO
{
    public Guid ScheduleId { get; set; }
    public int WeekNumber { get; set; }
    public int SessionNumber { get; set; }
    public string? SessionName { get; set; }
    public DateTime? ScheduledDate { get; set; }
    public TimeSpan? ScheduledTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? CompletedAt { get; set; }
    public List<ScheduledExerciseDTO> Exercises { get; set; } = new();
    public int TotalDurationMin { get; set; }  // Calculated
    public int EstimatedCaloriesBurned { get; set; }  // Calculated
}

public class ScheduledExerciseDTO
{
    public Guid Id { get; set; }
    public Guid ExerciseId { get; set; }
    public string ExerciseTitle { get; set; } = string.Empty;
    public string? PrimaryMuscle { get; set; }
    public string? Difficulty { get; set; }
    public int OrderIndex { get; set; }
    public int Sets { get; set; }
    public int Reps { get; set; }
    public int RestSeconds { get; set; }
    public string? Notes { get; set; }
    public string? VideoUrl { get; set; }
    public List<string>? Images { get; set; }
    public int CaloriesBurnedPerSet { get; set; }
}
