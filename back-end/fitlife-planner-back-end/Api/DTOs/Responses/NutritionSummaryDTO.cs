namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class NutritionSummaryDTO
{
    public int TotalCalories { get; set; }
    public double TotalProtein { get; set; }
    public double TotalCarbs { get; set; }
    public double TotalFat { get; set; }
    public int ItemCount { get; set; }
}
