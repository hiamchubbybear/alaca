namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class CreateWorkoutRequestDTO
{
    public string Title { get; set; }
    public string? Description { get; set; }
    public int? DurationMin { get; set; }
    public string? Intensity { get; set; }
    public List<WorkoutExerciseDTO>? Exercises { get; set; }
}

public class WorkoutExerciseDTO
{
    public Guid ExerciseId { get; set; }
    public int OrderIndex { get; set; }
    public int Sets { get; set; }
    public int Reps { get; set; }
    public int RestSeconds { get; set; }
    public string? Tempo { get; set; }
    public string? Notes { get; set; }
}
