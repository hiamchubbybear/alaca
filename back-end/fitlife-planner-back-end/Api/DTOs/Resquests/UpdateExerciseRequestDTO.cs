namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class UpdateExerciseRequestDTO
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? Difficulty { get; set; }
    public string? MuscleGroup { get; set; }
    public string? Equipment { get; set; }
    public string? Instructions { get; set; }
    public string? VideoUrl { get; set; }
}
