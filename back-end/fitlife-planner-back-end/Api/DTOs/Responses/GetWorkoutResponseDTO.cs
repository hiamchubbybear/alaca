namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class GetWorkoutResponseDTO
{
    public Guid Id { get; set; }
    public Guid OwnerUserId { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public int? DurationMin { get; set; }
    public string? Intensity { get; set; }
    public string? VideoUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<WorkoutExerciseDetailDTO>? Exercises { get; set; }
}

public class WorkoutExerciseDetailDTO
{
    public Guid Id { get; set; }
    public Guid ExerciseId { get; set; }
    public string ExerciseTitle { get; set; }
    public string? ExerciseVideoUrl { get; set; }
    public int? OrderIndex { get; set; }
    public int? Sets { get; set; }
    public string? Reps { get; set; }
    public int? RestSeconds { get; set; }
    public string? Tempo { get; set; }
    public string? Notes { get; set; }
}
