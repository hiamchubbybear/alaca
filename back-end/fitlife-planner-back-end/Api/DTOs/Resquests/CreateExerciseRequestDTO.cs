namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class CreateExerciseRequestDTO
{
    public string Title { get; set; }
    public string? Description { get; set; }
    public string? PrimaryMuscle { get; set; }
    public List<string>? SecondaryMuscles { get; set; }
    public string? Equipment { get; set; }
    public string? Difficulty { get; set; }
    public string? VideoUrl { get; set; }
    public List<string>? Images { get; set; }
    public List<string>? Tags { get; set; }
    public string? Instructions { get; set; }
    public int CaloriesBurnedPerSet { get; set; }
    public int RecommendedSets { get; set; }
    public int RecommendedReps { get; set; }
    public int RestSeconds { get; set; }
}
