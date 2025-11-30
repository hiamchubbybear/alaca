using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class Workout
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerUserId { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public int? DurationMin { get; set; }
    public string? Intensity { get; set; } // low, medium, high
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<WorkoutExercise> Exercises { get; set; } = new List<WorkoutExercise>();
}
