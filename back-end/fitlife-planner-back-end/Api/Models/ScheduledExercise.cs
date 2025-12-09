using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class ScheduledExercise
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ScheduleId { get; set; }       // FK to WorkoutSchedule
    public Guid ExerciseId { get; set; }       // FK to ExerciseLibrary
    public int OrderIndex { get; set; }        // Order in the session (1, 2, 3...)
    public int Sets { get; set; }
    public int Reps { get; set; }
    public int RestSeconds { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public WorkoutSchedule Schedule { get; set; }
    public ExerciseLibrary Exercise { get; set; }
}
