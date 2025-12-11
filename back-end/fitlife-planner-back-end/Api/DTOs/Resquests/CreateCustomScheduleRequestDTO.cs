namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class CreateCustomScheduleRequestDTO
{
    public int WeekNumber { get; set; } = 1;
    [System.Text.Json.Serialization.JsonPropertyName("dailyPlans")]
    public List<SessionRequestDTO> Sessions { get; set; } = new();
}

public class SessionRequestDTO
{
    public int SessionNumber { get; set; }     // Buổi thứ mấy (1-7)
    public string? SessionName { get; set; }   // Optional: "Push Day", "Leg Day"
    public DateTime? ScheduledDate { get; set; } // Optional specific date
    public List<ExerciseRequestDTO> Exercises { get; set; } = new();
}

public class ExerciseRequestDTO
{
    public Guid ExerciseId { get; set; }
    public int Sets { get; set; }
    public int Reps { get; set; }
    public int RestSeconds { get; set; }
    public string? Notes { get; set; }
}
