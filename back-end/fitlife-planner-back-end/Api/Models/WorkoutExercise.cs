using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class WorkoutExercise
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WorkoutId { get; set; }
    public Guid ExerciseId { get; set; }
    public int OrderIndex { get; set; }
    public int Sets { get; set; }
    public int Reps { get; set; } // Can be "10" or "8-12" or "AMRAP"
    public int RestSeconds { get; set; }
    public string? Tempo { get; set; } // e.g., "3-1-1-0"
    public string? Notes { get; set; }

    // Navigation properties
    public Workout? Workout { get; set; }
    public ExerciseLibrary? Exercise { get; set; }
}
