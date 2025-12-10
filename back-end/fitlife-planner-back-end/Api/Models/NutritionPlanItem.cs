using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class NutritionPlanItem
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlanId { get; set; }
    public string? MealTime { get; set; } // breakfast, lunch, dinner, snack
    public Guid FoodItemId { get; set; }
    public decimal? ServingCount { get; set; }
    public string? Notes { get; set; }
    public DateTime? Date { get; set; }
    public bool IsCompleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = TimeZoneInfo.ConvertTimeFromUtc(
        DateTime.UtcNow,
        TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")
    );

    // Navigation properties
    public NutritionPlan? NutritionPlan { get; set; }
    public FoodItem? FoodItem { get; set; }
}
