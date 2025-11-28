using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Util;

namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class ChoosePlanResponseDto
{
    public Guid BmiRecordId { get; set; }
    public double DailyCalories { get; set; }
    public BMIGoalPlan GoalPlan { get; set; }
    public MacroNutrition Nutrition { get; set; }
    public PracticeLevel PracticeLevel { get; set; }
    public double ActivityFactor { get; set; }
}
