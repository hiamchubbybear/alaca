namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class CreateExerciseRequestDTO
{
    public string Title { get; set; }
    public string? Description { get; set; }
    public string? PrimaryMuscle { get; set; }
    public string? SecondaryMuscles { get; set; }
    public string? Equipment { get; set; }
    public string? Difficulty { get; set; }
    public string? VideoUrl { get; set; }
    public string? Images { get; set; } // JSON
    public List<string>? Tags { get; set; }
}
