namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class CreateWeeklyNutritionPlanRequestDTO
{
    public DateTime WeekStartDate { get; set; } // Any date in the week, will find Monday
}
