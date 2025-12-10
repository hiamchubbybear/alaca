namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class GenerateMealPlanRequestDTO
{
    public DateTime Date { get; set; }
    public int? CaloriesTarget { get; set; } // Optional override
}

public class MarkMealCompletedRequestDTO
{
    public bool IsCompleted { get; set; }
}
