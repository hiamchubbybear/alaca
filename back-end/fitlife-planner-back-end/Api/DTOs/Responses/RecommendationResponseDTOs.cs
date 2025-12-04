namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class FoodRecommendationDTO
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CaloriesKcal { get; set; }
    public double ProteinG { get; set; }
    public double CarbsG { get; set; }
    public double FatG { get; set; }
    public string ServingSize { get; set; } = string.Empty;
    public double MatchScore { get; set; } // 0-100, how well it matches target macros
    public string Reason { get; set; } = string.Empty; // Why recommended
}

public class WorkoutRecommendationDTO
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PrimaryMuscle { get; set; } = string.Empty;
    public List<string> SecondaryMuscles { get; set; } = new();
    public string Difficulty { get; set; } = string.Empty;
    public int DurationMin { get; set; }
    public int EstimatedCaloriesBurned { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class DailyTipDTO
{
    public string Category { get; set; } = string.Empty; // fitness, nutrition, motivation
    public string Tip { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}

public class PersonalizedPlanDTO
{
    public string Goal { get; set; } = string.Empty;
    public double CurrentBMI { get; set; }
    public double TargetCalories { get; set; }
    public double ConsumedCalories { get; set; } // New: calories consumed today
    public double RemainingCalories { get; set; } // New: remaining calories for today
    public string GoalPlan { get; set; } = string.Empty; // New: WeightLoss, MuscleGain, Maintenance
    public int PracticeLevel { get; set; } // New: 0=Beginner, 1=Intermediate, 2=Advanced
    public MacroTargetsDTO MacroTargets { get; set; } = new();
    public List<FoodRecommendationDTO> BreakfastSuggestions { get; set; } = new();
    public List<FoodRecommendationDTO> LunchSuggestions { get; set; } = new();
    public List<FoodRecommendationDTO> DinnerSuggestions { get; set; } = new();
    public List<FoodRecommendationDTO> SnackSuggestions { get; set; } = new();
    public List<WorkoutRecommendationDTO> WorkoutSuggestions { get; set; } = new();
}

public class MacroTargetsDTO
{
    public double Calories { get; set; }
    public double ProteinG { get; set; }
    public double CarbsG { get; set; }
    public double FatG { get; set; }
}
