using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class WorkoutSchedule
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid? WorkoutId { get; set; } // Nullable - for custom schedules

    // Session-based scheduling
    public int WeekNumber { get; set; } = 1; // Week 1, 2, 3, etc.
    public int SessionNumber { get; set; } // Buổi 1, 2, 3, etc. in the week
    public string? SessionName { get; set; } // "Push Day", "Leg Day", etc.

    // Optional specific date/time if user wants to schedule
    public DateTime? ScheduledDate { get; set; }
    public TimeSpan? ScheduledTime { get; set; }

    public string Status { get; set; } = "planned"; // planned, completed, skipped
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Workout? Workout { get; set; }
    public ICollection<ScheduledExercise> ScheduledExercises { get; set; } = new List<ScheduledExercise>();
}
