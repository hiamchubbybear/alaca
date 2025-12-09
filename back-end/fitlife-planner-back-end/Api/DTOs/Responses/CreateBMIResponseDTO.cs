using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Util;

namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class CreateBMIResponseDto
{
    public double BMI { get; set; }
    public Guid BMIRecordID { get; set; }
    public string Assessment { get; set; }

    // All fields now required
    public BMIGoalPlan GoalPlan { get; set; }
    public MacroNutrition Nutrition { get; set; }
    public double DailyCalories { get; set; }
    public string PracticeLevel { get; set; }
    public double ActivityFactor { get; set; }

    public CreateBMIResponseDto()
    {
    }

    public CreateBMIResponseDto(double bmi, Guid bmiRecordId, string assessment)
    {
        BMI = bmi;
        BMIRecordID = bmiRecordId;
        Assessment = assessment;
    }
}
