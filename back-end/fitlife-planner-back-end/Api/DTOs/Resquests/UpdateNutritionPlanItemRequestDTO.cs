namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class UpdateNutritionPlanItemRequestDTO
{
    public Guid NewFoodItemId { get; set; }
    public string? MealTime { get; set; }
    public double? ServingCount { get; set; }
    public string? Notes { get; set; }
}
