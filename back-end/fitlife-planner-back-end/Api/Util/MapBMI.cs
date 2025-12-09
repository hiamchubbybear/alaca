namespace fitlife_planner_back_end.Api.Util;

public class BMIGoalPlan
{
    public int PlanId { get; set; }
    public string Assessment { get; set; } = "";
    public float WeeklyTargetKg { get; set; }
    public int ExercisePerWeek { get; set; }
    public string NextGoal { get; set; } = "";
}

public class BmiPlanRange
{
    public float Min { get; set; }
    public float Max { get; set; }
    public BMIGoalPlan Plan { get; set; }
}
