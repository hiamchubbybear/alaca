using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using fitlife_planner_back_end.Api.Extensions;

namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("recommendations")]
[Authorize]
public class RecommendationController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IUserContext _userContext;
    private readonly ILogger<RecommendationController> _logger;

    public RecommendationController(
        AppDbContext db,
        IUserContext userContext,
        ILogger<RecommendationController> logger)
    {
        _db = db;
        _userContext = userContext;
        _logger = logger;
    }

    /// <summary>
    /// Get recommended workouts based on user's current BMI and goal
    /// </summary>
    [HttpGet("workouts")]
    public async Task<IActionResult> GetRecommendedWorkouts(
        [FromQuery] string? goal = null,
        [FromQuery] int? days = null)
    {
        try
        {
            var userId = _userContext.User.userId;

            // Get user profile and current BMI record
            var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null)
            {
                return new ApiResponse<object>(
                    success: false,
                    message: "Profile not found. Please complete your profile first.",
                    statusCode: HttpStatusCode.NotFound
                ).ToActionResult();
            }

            var bmiRecord = await _db.BmiRecords
                .Where(b => b.ProfileId == profile.ProfileId && b.IsCurrent)
                .OrderByDescending(b => b.CreatedAt)
                .FirstOrDefaultAsync();

            if (bmiRecord == null)
            {
                return new ApiResponse<object>(
                    success: false,
                    message: "No BMI record found. Please calculate your BMI first.",
                    statusCode: HttpStatusCode.NotFound
                ).ToActionResult();
            }

            // Auto-determine goal from BMI goal plan if not provided
            var userGoal = goal ?? DetermineGoalFromBMI(bmiRecord);

            // Auto-determine days from practice level if not provided
            var workoutDays = days ?? DetermineDaysFromPracticeLevel(bmiRecord.PracticeLevel.ToString());

            // Determine difficulty based on goal and BMI
            var difficulty = DetermineDifficulty(userGoal, bmiRecord.BMI);

            // Get exercises based on goal
            var exercises = await GetExercisesByGoal(userGoal, difficulty);

            // Create workout plan structure
            var workoutPlan = CreateWorkoutPlan(exercises, workoutDays, userGoal);

            var response = new ApiResponse<object>(
                success: true,
                message: "Successfully retrieved workout recommendations",
                data: new
                {
                    plan = workoutPlan,
                    userInfo = new
                    {
                        bmi = bmiRecord.BMI,
                        goal = userGoal,
                        practiceLevel = bmiRecord.PracticeLevel,
                        recommendedDays = workoutDays
                    }
                },
                statusCode: HttpStatusCode.OK
            );

            return response.ToActionResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting workout recommendations");
            var response = new ApiResponse<object>(
                success: false,
                message: ex.Message,
                statusCode: HttpStatusCode.BadRequest
            );
            return response.ToActionResult();
        }
    }

    /// <summary>
    /// Get recommended exercises based on user's BMI and optional muscle group
    /// </summary>
    [HttpGet("exercises")]
    public async Task<IActionResult> GetRecommendedExercises(
        [FromQuery] string? muscle = null,
        [FromQuery] string? goal = null)
    {
        try
        {
            var userId = _userContext.User.userId;

            // Get user profile and current BMI record
            var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null)
            {
                return new ApiResponse<object>(
                    success: false,
                    message: "Profile not found. Please complete your profile first.",
                    statusCode: HttpStatusCode.NotFound
                ).ToActionResult();
            }

            var bmiRecord = await _db.BmiRecords
                .Where(b => b.ProfileId == profile.ProfileId && b.IsCurrent)
                .OrderByDescending(b => b.CreatedAt)
                .FirstOrDefaultAsync();

            if (bmiRecord == null)
            {
                return new ApiResponse<object>(
                    success: false,
                    message: "No BMI record found. Please calculate your BMI first.",
                    statusCode: HttpStatusCode.NotFound
                ).ToActionResult();
            }

            // Auto-determine goal from BMI if not provided
            var userGoal = goal ?? DetermineGoalFromBMI(bmiRecord);
            var difficulty = DetermineDifficulty(userGoal, bmiRecord.BMI);

            // Query exercises
            var query = _db.ExerciseLibrary.AsQueryable();

            // Filter by muscle if specified
            if (!string.IsNullOrEmpty(muscle))
            {
                query = query.Where(e => e.PrimaryMuscle.ToLower() == muscle.ToLower() ||
                                       e.SecondaryMuscles.Contains(muscle));
            }
            else
            {
                // If no muscle specified, get balanced recommendations
                // Focus on compound exercises for beginners, more variety for advanced
                if (difficulty == "beginner")
                {
                    query = query.Where(e => e.Tags.Contains("compound") || e.Tags.Contains("beginner"));
                }
            }

            // Filter by difficulty
            query = query.Where(e => e.Difficulty == difficulty || e.Difficulty == "beginner");

            var exercises = await query.Take(20).ToListAsync();

            var result = exercises.Select(e => new
            {
                e.Id,
                e.Title,
                e.Description,
                e.PrimaryMuscle,
                e.SecondaryMuscles,
                e.Equipment,
                e.Difficulty,
                e.Instructions,
                Tags = e.Tags != null ? e.Tags.Split(',') : new string[0],
                e.CaloriesBurnedPerSet,
                e.RecommendedSets,
                e.RecommendedReps,
                e.RestSeconds,
                e.VideoUrl,
                e.Images
            }).ToList();

            var response = new ApiResponse<object>(
                success: true,
                message: "Successfully retrieved exercise recommendations",
                data: new
                {
                    exercises = result,
                    muscle = muscle ?? "all",
                    goal = userGoal,
                    userInfo = new
                    {
                        bmi = bmiRecord.BMI,
                        difficulty,
                        practiceLevel = bmiRecord.PracticeLevel
                    }
                },
                statusCode: HttpStatusCode.OK
            );

            return response.ToActionResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting exercise recommendations");
            var response = new ApiResponse<object>(
                success: false,
                message: ex.Message,
                statusCode: HttpStatusCode.BadRequest
            );
            return response.ToActionResult();
        }
    }

    /// <summary>
    /// Get recommended meal plan based on user's current BMI and nutrition goals
    /// </summary>
    [HttpGet("meal-plan")]
    public async Task<IActionResult> GetRecommendedMealPlan(
        [FromQuery] int? targetCalories = null,
        [FromQuery] string? goal = null)
    {
        try
        {
            var userId = _userContext.User.userId;

            // Get user profile and current BMI record
            var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null)
            {
                return new ApiResponse<object>(
                    success: false,
                    message: "Profile not found. Please complete your profile first.",
                    statusCode: HttpStatusCode.NotFound
                ).ToActionResult();
            }

            var bmiRecord = await _db.BmiRecords
                .Where(b => b.ProfileId == profile.ProfileId && b.IsCurrent)
                .OrderByDescending(b => b.CreatedAt)
                .FirstOrDefaultAsync();

            if (bmiRecord == null)
            {
                return new ApiResponse<object>(
                    success: false,
                    message: "No BMI record found. Please calculate your BMI first.",
                    statusCode: HttpStatusCode.NotFound
                ).ToActionResult();
            }

            // Use BMI record data if parameters not provided
            // Calculate daily calories if not provided
            int calories;
            if (targetCalories.HasValue)
            {
                calories = targetCalories.Value;
            }
            else
            {
                // Estimate TDEE: simple formula
                // BMR (Mifflin-St Jeor) * activity factor
                // For simplicity, use a basic TDEE estimate
                var bmr = 10 * bmiRecord.WeightKg + 6.25 * bmiRecord.HeightCm - 5 * 30 + 5; // Assuming age 30
                calories = (int)(bmr * bmiRecord.ActivityFactor);
            }

            var userGoal = goal ?? DetermineGoalFromBMI(bmiRecord);

            // Calculate macro split based on goal
            var macros = CalculateMacros(calories, userGoal);

            // Get food items for each meal
            var breakfast = await GetMealRecommendations(calories * 0.25, macros, "high_protein");
            var lunch = await GetMealRecommendations(calories * 0.35, macros, "balanced");
            var dinner = await GetMealRecommendations(calories * 0.30, macros, "balanced");
            var snacks = await GetMealRecommendations(calories * 0.10, macros, "low_calorie");

            var mealPlan = new
            {
                targetCalories = calories,
                goal = userGoal,
                macros = new
                {
                    protein = macros["protein"],
                    carbs = macros["carbs"],
                    fat = macros["fat"]
                },
                meals = new
                {
                    breakfast,
                    lunch,
                    dinner,
                    snacks
                },
                userInfo = new
                {
                    bmi = bmiRecord.BMI,
                    practiceLevel = bmiRecord.PracticeLevel,
                    activityFactor = bmiRecord.ActivityFactor
                }
            };

            var response = new ApiResponse<object>(
                success: true,
                message: "Successfully retrieved meal plan recommendations",
                data: mealPlan,
                statusCode: HttpStatusCode.OK
            );

            return response.ToActionResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting meal plan recommendations");
            var response = new ApiResponse<object>(
                success: false,
                message: ex.Message,
                statusCode: HttpStatusCode.BadRequest
            );
            return response.ToActionResult();
        }
    }

    /// <summary>
    /// Get food recommendations by macro focus
    /// </summary>
    [HttpGet("foods")]
    public async Task<IActionResult> GetFoodRecommendations(
        [FromQuery] string macroFocus = "protein",
        [FromQuery] int maxCalories = 500,
        [FromQuery] int? minProtein = null)
    {
        try
        {
            var query = _db.FoodItems.AsQueryable();

            // Filter by max calories
            query = query.Where(f => f.CaloriesKcal <= maxCalories);

            // Filter by min protein if specified
            if (minProtein.HasValue)
            {
                query = query.Where(f => f.ProteinG >= minProtein.Value);
            }

            // Order by macro focus
            query = macroFocus.ToLower() switch
            {
                "protein" => query.OrderByDescending(f => f.ProteinG),
                "carbs" => query.OrderByDescending(f => f.CarbsG),
                "fat" => query.OrderByDescending(f => f.FatG),
                _ => query.OrderBy(f => f.CaloriesKcal)
            };

            var foods = await query.Take(20).ToListAsync();

            var response = new ApiResponse<object>(
                success: true,
                message: "Successfully retrieved food recommendations",
                data: new { foods, macroFocus, maxCalories },
                statusCode: HttpStatusCode.OK
            );

            return response.ToActionResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting food recommendations");
            var response = new ApiResponse<object>(
                success: false,
                message: ex.Message,
                statusCode: HttpStatusCode.BadRequest
            );
            return response.ToActionResult();
        }
    }

    #region Helper Methods

    private string DetermineDifficulty(string goal, double? bmi)
    {
        // Simple logic - can be enhanced
        if (goal == "weight_loss" || (bmi.HasValue && bmi.Value < 20))
            return "beginner";
        if (goal == "muscle_gain")
            return "intermediate";
        return "beginner";
    }

    private string DetermineGoalFromBMI(BMIRecord bmiRecord)
    {
        // Determine goal based on BMI assessment
        // BMI < 18.5: weight gain
        // BMI 18.5-24.9: maintenance/muscle gain
        // BMI >= 25: weight loss

        if (bmiRecord.BMI < 18.5)
            return "muscle_gain"; // Need to gain weight
        else if (bmiRecord.BMI >= 25)
            return "weight_loss"; // Need to lose weight
        else
            return "muscle_gain"; // Healthy range, can build muscle
    }

    private int DetermineDaysFromPracticeLevel(string? practiceLevel)
    {
        return (practiceLevel?.ToUpper()) switch
        {
            "NEWBIE" => 2,
            "EASY" => 3,
            "MEDIUM" => 4,
            "HARD" => 5,
            "PRO" => 6,
            _ => 3
        };
    }

    private async Task<List<object>> GetExercisesByGoal(string goal, string difficulty)
    {
        var query = _db.ExerciseLibrary.AsQueryable();

        // Filter by difficulty
        if (!string.IsNullOrEmpty(difficulty))
        {
            query = query.Where(e => e.Difficulty == difficulty || e.Difficulty == "beginner");
        }

        // Filter by goal-specific tags
        var exercises = goal.ToLower() switch
        {
            "weight_loss" => await query.Where(e => e.Tags.Contains("cardio") ||
                                                    e.Tags.Contains("bodyweight"))
                                       .Take(20).ToListAsync(),
            "muscle_gain" => await query.Where(e => e.Tags.Contains("strength") ||
                                                    e.Tags.Contains("compound"))
                                        .Take(20).ToListAsync(),
            _ => await query.Take(20).ToListAsync()
        };

        return exercises.Select(e => new
        {
            e.Id,
            e.Title,
            e.PrimaryMuscle,
            e.Difficulty,
            e.CaloriesBurnedPerSet,
            e.RecommendedSets,
            e.RecommendedReps,
            e.RestSeconds
        } as object).ToList();
    }

    private object CreateWorkoutPlan(List<object> exercises, int daysPerWeek, string goal)
    {
        var splitTypes = daysPerWeek switch
        {
            3 => new[] { "full_body", "full_body", "full_body" },
            4 => new[] { "upper", "lower", "upper", "lower" },
            5 => new[] { "chest_triceps", "back_biceps", "legs", "shoulders", "full_body" },
            6 => new[] { "chest", "back", "legs", "shoulders", "arms", "core" },
            _ => new[] { "full_body", "full_body", "full_body" }
        };

        return new
        {
            goal,
            daysPerWeek,
            splitType = daysPerWeek >= 4 ? "split" : "full_body",
            recommendedExercises = exercises,
            note = $"Recommended {daysPerWeek}-day workout plan for {goal}"
        };
    }

    private Dictionary<string, int> CalculateMacros(int targetCalories, string goal)
    {
        // Macro ratios based on goal
        var (proteinRatio, carbsRatio, fatRatio) = goal.ToLower() switch
        {
            "muscle_gain" => (0.30, 0.45, 0.25),    // High protein & carbs
            "weight_loss" => (0.35, 0.30, 0.35),    // High protein, moderate fat
            _ => (0.25, 0.45, 0.30)                 // Balanced
        };

        return new Dictionary<string, int>
        {
            ["protein"] = (int)(targetCalories * proteinRatio / 4),  // 4 cal/g
            ["carbs"] = (int)(targetCalories * carbsRatio / 4),      // 4 cal/g
            ["fat"] = (int)(targetCalories * fatRatio / 9)           // 9 cal/g
        };
    }

    private async Task<object> GetMealRecommendations(double targetCalories, Dictionary<string, int> macros, string type)
    {
        var foods = await _db.FoodItems
            .Where(f => f.CaloriesKcal <= targetCalories * 1.2)
            .OrderBy(f => Math.Abs((double)f.CaloriesKcal - targetCalories))
            .Take(5)
            .Select(f => new
            {
                f.Id,
                f.Name,
                f.CaloriesKcal,
                f.ProteinG,
                f.CarbsG,
                f.FatG,
                f.ServingSize,
                f.ServingAmount
            })
            .ToListAsync();

        return new
        {
            targetCalories = (int)targetCalories,
            type,
            recommendedFoods = foods
        };
    }

    #endregion
}
