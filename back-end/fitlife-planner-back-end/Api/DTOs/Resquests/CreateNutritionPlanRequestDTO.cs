namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class CreateNutritionPlanRequestDTO
{
    public string Title { get; set; }
    public string? Description { get; set; }
    public int? CaloriesTargetKcal { get; set; }
    public string? Macros { get; set; } // JSON
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Visibility { get; set; } // private, public, friends
}
