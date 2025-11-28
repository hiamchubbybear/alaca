using fitlife_planner_back_end.Api.Models;

namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class ChoosePlanRequestDto
{
    
    public PracticeLevel PracticeLevel { get; }
    public double ActivityFactor { get; }
}