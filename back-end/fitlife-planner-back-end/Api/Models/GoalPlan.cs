namespace fitlife_planner_back_end.Api.Models;

public class GoalPlan
{
    public int PlanId { get; set; }
    public string Goal { get; set; }
    public float WeeklyTargetKg { get; set; }
    public int ExercisePerWeek { get; set; }
    public MacroNutrition Nutrition { get; set; }
    public string Description { get; set; }
}