namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class GetNutritionPlanResponseDTO
{
    public Guid Id { get; set; }
    public Guid OwnerUserId { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public int? CaloriesTargetKcal { get; set; }
    public string? Macros { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Visibility { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<GetNutritionPlanItemResponseDTO>? Items { get; set; }
}

public class GetNutritionPlanItemResponseDTO
{
    public Guid Id { get; set; }
    public string? MealTime { get; set; }
    public Guid FoodItemId { get; set; }
    public string FoodItemName { get; set; }
    public decimal? ServingCount { get; set; }
    public string? Notes { get; set; }
}
