using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class NutritionPlan
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerUserId { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? CaloriesTargetKcal { get; set; }
    public string? Macros { get; set; } // JSON
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Visibility { get; set; } // private, public, friends
    public DateTime CreatedAt { get; set; } = TimeZoneInfo.ConvertTimeFromUtc(
        DateTime.UtcNow,
        TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")
    );
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<NutritionPlanItem> Items { get; set; } = new List<NutritionPlanItem>();
}

public class MacroNutrition
{
    public double Calories { get; set; }
    public double Protein { get; set; }
    public double Carbs { get; set; }
    public double Fat { get; set; }
}
