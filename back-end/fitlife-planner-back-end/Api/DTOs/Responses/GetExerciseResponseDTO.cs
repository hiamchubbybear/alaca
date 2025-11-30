namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class GetExerciseResponseDTO
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public string? PrimaryMuscle { get; set; }
    public string? SecondaryMuscles { get; set; }
    public string? Equipment { get; set; }
    public string? Difficulty { get; set; }
    public string? VideoUrl { get; set; }
    public string? Images { get; set; }
    public List<string>? Tags { get; set; }
    public DateTime CreatedAt { get; set; }
}
