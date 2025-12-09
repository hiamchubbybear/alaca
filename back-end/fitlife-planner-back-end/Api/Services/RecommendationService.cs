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
    /// Get personalized daily plan based on user profile, BMI record, and current nutrition plan
    /// </summary>
    public virtual async Task<PersonalizedPlanDTO> GetPersonalizedPlan()
    {
        var userId = _userContext.User.userId;
        var profileId = _userContext.User.profileId;

        // Get user profile
        var profile = await _dbContext.Profiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            throw new Exception("User profile not found. Please create a profile first.");
        }

        // Get latest BMI record
        var latestBMI = await _dbContext.BmiRecords
            .Where(b => b.ProfileId == profileId && b.IsCurrent)
            .OrderByDescending(b => b.MeasuredAt)
            .FirstOrDefaultAsync();

        if (latestBMI == null)
        {
            throw new Exception("No BMI record found. Please calculate your BMI first.");
        }

        // Calculate daily calories based on BMI record
        var dailyCalories = _bmiUtil.CalculateDailyCalories(
            latestBMI.WeightKg,
            latestBMI.HeightCm,
            latestBMI.ActivityFactor,
            0 // weeklyTargetKg - get from goal if available
        );

        // Get macros
        var macros = _bmiUtil.MapCaloriesToMacros(dailyCalories, latestBMI.BMI);

        // Get today's consumed calories from nutrition plan
        var today = DateTime.UtcNow.Date;
        var nutritionPlan = await _dbContext.NutritionPlans
            .Where(np => np.OwnerUserId == userId)
            .OrderByDescending(np => np.CreatedAt)
            .FirstOrDefaultAsync();

        double consumedCalories = 0;
        if (nutritionPlan != null)
        {
            var todayItems = await _dbContext.Set<NutritionPlanItem>()
                .Where(npi => npi.PlanId == nutritionPlan.Id
                           && npi.CreatedAt.Date == today)
                .Include(npi => npi.FoodItem)
                .ToListAsync();

            consumedCalories = todayItems
                .Where(item => item.FoodItem != null)
                .Sum(item => (item.FoodItem.CaloriesKcal ?? 0) * (double)(item.ServingCount ?? 1));
        }

        var remainingCalories = dailyCalories - consumedCalories;

        // Determine goal based on BMI
        var goalPlan = latestBMI.BMI > 25 ? "WeightLoss"
                     : latestBMI.BMI < 18.5 ? "MuscleGain"
                     : "Maintenance";

        // Get smart meal recommendations based on remaining calories and goal
        var breakfast = await RecommendMealsForGoal(remainingCalories, "breakfast", goalPlan, 5);
        var lunch = await RecommendMealsForGoal(remainingCalories, "lunch", goalPlan, 5);
        var dinner = await RecommendMealsForGoal(remainingCalories, "dinner", goalPlan, 5);
        var snacks = await RecommendMealsForGoal(remainingCalories, "snack", goalPlan, 3);

        // Get smart workout recommendations based on practice level and goal
        var difficulty = latestBMI.PracticeLevel switch
        {
            PracticeLevel.PRO => "advanced",
            PracticeLevel.HARD => "advanced",
            PracticeLevel.MEDIUM => "intermediate",
            PracticeLevel.EASY => "beginner",
            PracticeLevel.NEWBIE => "beginner",
            _ => "beginner"
        };

        var workouts = await RecommendWorkoutsForGoal(latestBMI.BMI, goalPlan, difficulty, 5);

        return new PersonalizedPlanDTO
        {
            Goal = latestBMI.Assessment,
            CurrentBMI = latestBMI.BMI,
            TargetCalories = dailyCalories,
            ConsumedCalories = consumedCalories,
            RemainingCalories = remainingCalories,
            GoalPlan = goalPlan,
            PracticeLevel = (int)latestBMI.PracticeLevel,
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
    /// Recommend meals based on goal plan (smart filtering)
    /// </summary>
    private async Task<List<FoodRecommendationDTO>> RecommendMealsForGoal(
        double remainingCalories,
        string mealType,
        string goalPlan,
        int limit)
    {
        // Calculate calorie allocation by meal type
        var mealCalories = mealType.ToLower() switch
        {
            "breakfast" => remainingCalories * 0.25, // 25% of remaining calories
            "lunch" => remainingCalories * 0.35,     // 35%
            "dinner" => remainingCalories * 0.30,    // 30%
            "snack" => remainingCalories * 0.10,     // 10%
            _ => remainingCalories * 0.25
        };

        // Query food items within calorie range (±30%)
        var minCalories = mealCalories * 0.7;
        var maxCalories = mealCalories * 1.3;

        var query = _dbContext.FoodItems
            .Where(f => f.CaloriesKcal >= minCalories && f.CaloriesKcal <= maxCalories);

        // Smart filtering based on goal
        List<FoodItem> foodItems;
        if (goalPlan == "WeightLoss")
        {
            // Prefer high protein, low carb
            foodItems = await query
                .OrderByDescending(f => f.ProteinG)
                .ThenBy(f => f.CarbsG)
                .Take(limit)
                .ToListAsync();
        }
        else if (goalPlan == "MuscleGain")
        {
            // Prefer high protein, moderate carbs
            foodItems = await query
                .OrderByDescending(f => f.ProteinG)
                .ThenByDescending(f => f.CarbsG)
                .Take(limit)
                .ToListAsync();
        }
        else // Maintenance
        {
            // Balanced - closest to target calories
            foodItems = await query
                .OrderBy(f => Math.Abs((f.CaloriesKcal ?? 0) - mealCalories))
                .Take(limit)
                .ToListAsync();
        }

        return foodItems.Select(f => new FoodRecommendationDTO
        {
            Id = f.Id,
            Name = f.Name,
            CaloriesKcal = f.CaloriesKcal ?? 0,
            ProteinG = (double)(f.ProteinG ?? 0),
            CarbsG = (double)(f.CarbsG ?? 0),
            FatG = (double)(f.FatG ?? 0),
            ServingSize = f.ServingSize ?? "100g",
            MatchScore = CalculateMatchScore(f.CaloriesKcal ?? 0, mealCalories),
            Reason = GenerateFoodReasonForGoal(f, goalPlan, mealType)
        }).ToList();
    }

    /// <summary>
    /// Recommend workouts based on goal plan and difficulty
    /// </summary>
    private async Task<List<WorkoutRecommendationDTO>> RecommendWorkoutsForGoal(
        double bmi,
        string goalPlan,
        string difficulty,
        int limit)
    {
        var query = _dbContext.ExerciseLibrary
            .Where(e => e.Difficulty.ToLower() == difficulty.ToLower());

        var exercises = await query.ToListAsync();

        if (!exercises.Any())
        {
            // Fallback to all exercises if no match
            exercises = await _dbContext.ExerciseLibrary.Take(limit).ToListAsync();
        }

        // Filter and prioritize by goal
        var recommendations = exercises.Select(e => new
        {
            Exercise = e,
            Priority = CalculateWorkoutPriority(e, goalPlan)
        })
        .OrderByDescending(x => x.Priority)
        .Take(limit)
        .Select(x => new WorkoutRecommendationDTO
        {
            Id = x.Exercise.Id,
            Title = x.Exercise.Title,
            Description = x.Exercise.Description,
            PrimaryMuscle = x.Exercise.PrimaryMuscle,
            SecondaryMuscles = string.IsNullOrEmpty(x.Exercise.SecondaryMuscles)
                ? new List<string>()
                : x.Exercise.SecondaryMuscles.Split(',').Select(m => m.Trim()).ToList(),
            Difficulty = x.Exercise.Difficulty,
            DurationMin = 30,
            EstimatedCaloriesBurned = EstimateCaloriesBurned(x.Exercise.Difficulty, 30),
            Reason = GenerateWorkoutReasonForGoal(x.Exercise, goalPlan, bmi)
        })
        .ToList();

        return recommendations;
    }

    private int CalculateWorkoutPriority(ExerciseLibrary exercise, string goalPlan)
    {
        var priority = 50; // Base priority

        if (goalPlan == "WeightLoss")
        {
            // Prefer full-body and cardio
            if (exercise.PrimaryMuscle?.ToLower().Contains("full") == true) priority += 30;
            if (exercise.PrimaryMuscle?.ToLower().Contains("cardio") == true) priority += 30;
            if (exercise.PrimaryMuscle?.ToLower().Contains("legs") == true) priority += 20;
        }
        else if (goalPlan == "MuscleGain")
        {
            // Prefer compound movements
            if (exercise.PrimaryMuscle?.ToLower().Contains("chest") == true) priority += 25;
            if (exercise.PrimaryMuscle?.ToLower().Contains("back") == true) priority += 25;
            if (exercise.PrimaryMuscle?.ToLower().Contains("legs") == true) priority += 25;
        }
        else
        {
            // Maintenance - Balanced
            if (exercise.Tags?.ToLower().Contains("compound") == true) priority += 20;
            if (exercise.PrimaryMuscle?.ToLower().Contains("core") == true) priority += 15;
            if (exercise.PrimaryMuscle?.ToLower().Contains("full") == true) priority += 15;
        }

        return priority;
    }

    private string GenerateFoodReasonForGoal(FoodItem food, string goalPlan, string mealType)
    {
        var protein = (double)(food.ProteinG ?? 0);
        var carbs = (double)(food.CarbsG ?? 0);
        var calories = food.CaloriesKcal ?? 0;

        if (goalPlan == "WeightLoss")
        {
            if (protein > 20)
                return $"High protein ({protein:F1}g) keeps you full longer - perfect for weight loss";
            if (calories < 200)
                return $"Low calorie ({calories} kcal) option for weight loss";
            return $"Balanced option for {mealType} with {calories} kcal";
        }
        else if (goalPlan == "MuscleGain")
        {
            if (protein > 20 && carbs > 30)
                return $"Great for muscle building: {protein:F1}g protein + {carbs:F1}g carbs";
            if (protein > 20)
                return $"High protein ({protein:F1}g) supports muscle growth";
            return $"Good energy source with {carbs:F1}g carbs for workouts";
        }
        else // Maintenance
        {
            return $"Balanced meal for {mealType} with {calories} kcal";
        }
    }

    private string GenerateWorkoutReasonForGoal(ExerciseLibrary exercise, string goalPlan, double bmi)
    {
        if (goalPlan == "WeightLoss")
            return $"Burns calories effectively, targets {exercise.PrimaryMuscle} - great for fat loss";
        if (goalPlan == "MuscleGain")
            return $"Builds {exercise.PrimaryMuscle} strength and muscle mass";
        return $"Maintains {exercise.PrimaryMuscle} fitness and overall health";
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
