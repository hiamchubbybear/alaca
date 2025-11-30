using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class ExerciseLibrary
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; }
    public string? Description { get; set; }
    public string? PrimaryMuscle { get; set; }
    public string? SecondaryMuscles { get; set; }
    public string? Equipment { get; set; }
    public string? Difficulty { get; set; } // beginner, intermediate, advanced
    public string? VideoUrl { get; set; }
    public string? Images { get; set; } // JSON array
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<ExerciseTag> Tags { get; set; } = new List<ExerciseTag>();
}
