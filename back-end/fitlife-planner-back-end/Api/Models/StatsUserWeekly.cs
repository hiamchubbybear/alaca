using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class StatsUserWeekly
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public DateTime? WeekStart { get; set; }
    public int? WorkoutsCompleted { get; set; }
    public int? CaloriesBurnedEst { get; set; }
    public int? Steps { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
