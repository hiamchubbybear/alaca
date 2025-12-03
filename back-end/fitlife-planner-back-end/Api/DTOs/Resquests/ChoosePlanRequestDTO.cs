using fitlife_planner_back_end.Api.Models;

namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class ChoosePlanRequestDto
{
    public PracticeLevel PracticeLevel { get; set; }
    public double ActivityFactor { get; set; }

    public ChoosePlanRequestDto(PracticeLevel practiceLevel, double activityFactor)
    {
        PracticeLevel = practiceLevel;
        ActivityFactor = activityFactor;
    }

    public ChoosePlanRequestDto()
    {
    }
}
