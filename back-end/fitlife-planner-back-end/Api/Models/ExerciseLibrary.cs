using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class ExerciseLibrary
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; }
    public string? Description { get; set; }
    public string? PrimaryMuscle { get; set; }
    public string? SecondaryMuscles { get; set; } // CSV
    public string? Equipment { get; set; } // CSV
    public string? Difficulty { get; set; } // beginner, intermediate, advanced
    public string? Instructions { get; set; } // JSON array of instruction steps
    public string? Tags { get; set; } // CSV: compound, strength, push, etc.
    public int CaloriesBurnedPerSet { get; set; } // Calories burned per set
    public string? RecommendedSets { get; set; } // e.g., "3-4"
    public string? RecommendedReps { get; set; } // e.g., "8-12"
    public int RestSeconds { get; set; } // Rest time between sets in seconds
    public string? VideoUrl { get; set; }
    public string? Images { get; set; } // JSON array
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<ExerciseTag> ExerciseTags { get; set; } = new List<ExerciseTag>();
}
