using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class WorkoutSchedule
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid WorkoutId { get; set; }
    public DateTime? ScheduledDate { get; set; }
    public TimeSpan? ScheduledTime { get; set; }
    public string Status { get; set; } = "planned"; // planned, completed, skipped
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Workout? Workout { get; set; }
}
