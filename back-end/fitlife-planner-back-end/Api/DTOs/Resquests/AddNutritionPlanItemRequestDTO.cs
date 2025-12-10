namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class AddNutritionPlanItemRequestDTO
{
    public string? MealTime { get; set; } // breakfast, lunch, dinner, snack
    public Guid FoodItemId { get; set; }
    public decimal? ServingCount { get; set; }
    public string? Notes { get; set; }
    public DateTime? Date { get; set; }
}
