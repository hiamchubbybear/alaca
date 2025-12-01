using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Util;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Services;

public class RecommendationService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<RecommendationService> _logger;
    private readonly IUserContext _userContext;
    private readonly BMIUtil _bmiUtil;

    public RecommendationService(
        AppDbContext dbContext,
        ILogger<RecommendationService> logger,
        IUserContext userContext,
        BMIUtil bmiUtil)
    {
        _dbContext = dbContext;
        _logger = logger;
        _userContext = userContext;
        _bmiUtil = bmiUtil;
    }

    /// <summary>
    /// Recommend meals based on target macros and meal type
    /// </summary>
    public virtual async Task<List<FoodRecommendationDTO>> RecommendMeals(
        double targetCalories,
        string mealType, // breakfast, lunch, dinner, snack
        int limit = 10)
    {
        // Calculate calorie allocation by meal type
        var mealCalories = mealType.ToLower() switch
        {
            "breakfast" => targetCalories * 0.25, // 25% of daily calories
            "lunch" => targetCalories * 0.35,     // 35%
            "dinner" => targetCalories * 0.30,    // 30%
            "snack" => targetCalories * 0.10,     // 10%
            _ => targetCalories * 0.25
        };

        // Query food items within calorie range (±30%)
        var minCalories = mealCalories * 0.7;
        var maxCalories = mealCalories * 1.3;

        var foodItems = await _dbContext.FoodItems
            .Where(f => f.CaloriesKcal >= minCalories && f.CaloriesKcal <= maxCalories)
            .ToListAsync();

        if (!foodItems.Any())
        {
            _logger.LogWarning("No food items found in calorie range {Min}-{Max}", minCalories, maxCalories);
            return new List<FoodRecommendationDTO>();
        }

        // Score each food item by how close it is to target calories
        var recommendations = foodItems.Select(f => new FoodRecommendationDTO
        {
            Id = f.Id,
            Name = f.Name,
            CaloriesKcal = f.CaloriesKcal ?? 0,
            ProteinG = (double)(f.ProteinG ?? 0),
            CarbsG = (double)(f.CarbsG ?? 0),
            FatG = (double)(f.FatG ?? 0),
            ServingSize = f.ServingSize ?? "100g",
            MatchScore = CalculateMatchScore(f.CaloriesKcal ?? 0, mealCalories),
            Reason = GenerateFoodReason(f, mealType)
        })
        .OrderByDescending(r => r.MatchScore)
        .Take(limit)
        .ToList();

        return recommendations;
    }

    /// <summary>
    /// Recommend workout plan based on user's BMI, goal, and fitness level
    /// </summary>
    public virtual async Task<List<WorkoutRecommendationDTO>> RecommendWorkouts(
        double bmi,
        string goal, // weight_loss, muscle_gain, maintenance
        string fitnessLevel, // beginner, intermediate, advanced
        int limit = 5)
    {
        // Determine difficulty based on fitness level
        var targetDifficulty = fitnessLevel.ToLower() switch
        {
            "beginner" => "beginner",
            "intermediate" => "intermediate",
            "advanced" => "advanced",
            _ => "beginner"
        };

        // Get exercises matching difficulty
        var exercises = await _dbContext.ExerciseLibrary
            .Where(e => e.Difficulty.ToLower() == targetDifficulty)
            .ToListAsync();

        if (!exercises.Any())
        {
            // Fallback to all exercises if no match
            exercises = await _dbContext.ExerciseLibrary.ToListAsync();
        }

        // Filter by goal
        var recommendations = exercises.Select(e => new WorkoutRecommendationDTO
        {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            PrimaryMuscle = e.PrimaryMuscle,
            SecondaryMuscles = string.IsNullOrEmpty(e.SecondaryMuscles)
                ? new List<string>()
                : e.SecondaryMuscles.Split(',').Select(m => m.Trim()).ToList(),
            Difficulty = e.Difficulty,
            DurationMin = 30, // Default duration
            EstimatedCaloriesBurned = EstimateCaloriesBurned(e.Difficulty, 30),
            Reason = GenerateWorkoutReason(e, goal, bmi)
        })
        .Take(limit)
        .ToList();

        return recommendations;
    }

    /// <summary>
    /// Get personalized daily plan based on user profile
    /// </summary>
    public virtual async Task<PersonalizedPlanDTO> GetPersonalizedPlan()
    {
        var userId = _userContext.User.userId;

        // Get user profile
        var profile = await _dbContext.Profiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            throw new Exception("User profile not found");
        }

        // Get latest BMI record for height/weight
        var latestBMI = await _dbContext.BmiRecords
            .Where(b => b.ProfileId == profile.ProfileId)
            .OrderByDescending(b => b.MeasuredAt)
            .FirstOrDefaultAsync();

        var heightCm = latestBMI?.HeightCm ?? 170;
        var weightKg = (double)(latestBMI?.WeightKg ?? 70);

        // Calculate BMI and macros
        var bmi = _bmiUtil.CalculateBMI(heightCm, weightKg);
        var goalPlan = _bmiUtil.GetGoalPlanByBmi(bmi);
        var dailyCalories = _bmiUtil.CalculateDailyCalories(
            weightKg,
            heightCm,
            1.5, // Moderate activity
            goalPlan.WeeklyTargetKg
        );
        var macros = _bmiUtil.MapCaloriesToMacros(dailyCalories, bmi);

        // Get meal recommendations
        var breakfast = await RecommendMeals(dailyCalories, "breakfast", 5);
        var lunch = await RecommendMeals(dailyCalories, "lunch", 5);
        var dinner = await RecommendMeals(dailyCalories, "dinner", 5);
        var snacks = await RecommendMeals(dailyCalories, "snack", 3);

        // Get workout recommendations
        var goal = bmi > 25 ? "weight_loss" : bmi < 18.5 ? "muscle_gain" : "maintenance";
        var workouts = await RecommendWorkouts(bmi, goal, "intermediate", 5);

        return new PersonalizedPlanDTO
        {
            Goal = goalPlan.Assessment,
            CurrentBMI = bmi,
            TargetCalories = dailyCalories,
            MacroTargets = new MacroTargetsDTO
            {
                Calories = macros.Calories,
                ProteinG = macros.Protein,
                CarbsG = macros.Carbs,
                FatG = macros.Fat
            },
            BreakfastSuggestions = breakfast,
            LunchSuggestions = lunch,
            DinnerSuggestions = dinner,
            SnackSuggestions = snacks,
            WorkoutSuggestions = workouts
        };
    }

    /// <summary>
    /// Get daily fitness/nutrition tip
    /// </summary>
    public virtual async Task<DailyTipDTO> GetDailyTip()
    {
        var tips = new List<(string category, string tip)>
        {
            ("fitness", "Consistency beats intensity. Show up every day, even for 10 minutes."),
            ("nutrition", "Drink water before meals to help control portion sizes."),
            ("motivation", "Your body can stand almost anything. It's your mind you have to convince."),
            ("fitness", "Compound exercises like squats and deadlifts burn more calories."),
            ("nutrition", "Protein helps you feel full longer and preserves muscle mass."),
            ("motivation", "Progress, not perfection. Every small step counts."),
            ("fitness", "Rest days are when your muscles grow. Don't skip them."),
            ("nutrition", "Meal prep on Sundays to stay on track all week."),
            ("motivation", "The only bad workout is the one that didn't happen."),
            ("fitness", "Focus on form over weight to prevent injuries."),
        };

        // Rotate tips based on day of year
        var dayOfYear = DateTime.UtcNow.DayOfYear;
        var tipIndex = dayOfYear % tips.Count;
        var (category, tip) = tips[tipIndex];

        return new DailyTipDTO
        {
            Category = category,
            Tip = tip,
            Date = DateTime.UtcNow
        };
    }

    // Helper methods
    private double CalculateMatchScore(int actualCalories, double targetCalories)
    {
        var difference = Math.Abs(actualCalories - targetCalories);
        var percentDiff = (difference / targetCalories) * 100;
        return Math.Max(0, 100 - percentDiff);
    }

    private string GenerateFoodReason(FoodItem food, string mealType)
    {
        if (food.ProteinG > 20)
            return $"High protein ({food.ProteinG}g) - great for {mealType}";
        if (food.CarbsG > 40)
            return $"Good carb source ({food.CarbsG}g) for energy";
        if (food.CaloriesKcal < 200)
            return "Low calorie option";
        return $"Balanced meal for {mealType}";
    }

    private string GenerateWorkoutReason(ExerciseLibrary exercise, string goal, double bmi)
    {
        if (goal == "weight_loss")
            return $"Burns calories effectively, targets {exercise.PrimaryMuscle}";
        if (goal == "muscle_gain")
            return $"Builds {exercise.PrimaryMuscle} strength";
        return $"Maintains {exercise.PrimaryMuscle} fitness";
    }

    private int EstimateCaloriesBurned(string difficulty, int durationMin)
    {
        var caloriesPerMin = difficulty.ToLower() switch
        {
            "beginner" => 5,
            "intermediate" => 8,
            "advanced" => 12,
            _ => 6
        };
        return caloriesPerMin * durationMin;
    }
}
