using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using fitlife_planner_back_end.Api.Extensions;
using fitlife_planner_back_end.Api.Models;

namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("profile")]
[Authorize]
public class ProfileGoalsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IUserContext _userContext;
    private readonly ILogger<ProfileGoalsController> _logger;

    public ProfileGoalsController(
        AppDbContext db,
        IUserContext userContext,
        ILogger<ProfileGoalsController> logger)
    {
        _db = db;
        _userContext = userContext;
        _logger = logger;
    }

    /// <summary>
    /// Update user goals and calculate BMI/TDEE
    /// </summary>
    [HttpPut("goals")]
    public async Task<IActionResult> UpdateUserGoals([FromBody] UpdateGoalsRequest request)
    {
        try
        {
            var userId = _userContext.User.userId;
            var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                return new ApiResponse<object>(
                    success: false,
                    message: "Profile not found",
                    statusCode: HttpStatusCode.NotFound
                ).ToActionResult();
            }

            // Calculate BMI
            var heightM = request.Height / 100.0; // Convert cm to meters
            var bmi = request.Weight / (heightM * heightM);

            // Calculate TDEE (Total Daily Energy Expenditure)
            var bmr = CalculateBMR(request.Weight, request.Height, request.Age, request.Gender);
            var tdee = CalculateTDEE(bmr, request.ActivityLevel);

            // Calculate daily calorie target based on goal
            var dailyCalories = CalculateDailyCalories(tdee, request.Goal, request.WeeklyGoal);

            // Calculate macro split
            var macros = CalculateMacros(dailyCalories, request.Goal);

            // Determine BMI assessment
            var assessment = GetBMIAssessment(bmi);

            // Create or update BMI record
            var existingBmi = await _db.BmiRecords
                .Where(b => b.ProfileId == profile.ProfileId && b.IsCurrent)
                .ToListAsync();

            // Mark old records as not current
            foreach (var old in existingBmi)
            {
                old.IsCurrent = false;
            }

            // Create new BMI record with goals
            var goals = new Dictionary<string, object>
            {
                ["goal"] = request.Goal,
                ["targetWeight"] = request.TargetWeight,
                ["weeklyGoal"] = request.WeeklyGoal,
                ["activityLevel"] = request.ActivityLevel,
                ["dailyCalories"] = dailyCalories,
                ["tdee"] = tdee,
                ["macros"] = macros
            };

            var bmiRecord = new BMIRecord
            {
                BmiRecordId = Guid.NewGuid(),
                ProfileId = profile.ProfileId,
                HeightCm = request.Height,
                WeightKg = request.Weight,
                BMI = bmi,
                Assessment = assessment,
                IsCurrent = true,
                IsComplete = true,
                MeasuredAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                Goal = goals
            };

            _db.BmiRecords.Add(bmiRecord);
            await _db.SaveChangesAsync();

            var response = new ApiResponse<object>(
                success: true,
                message: "Successfully updated goals and calculated metrics",
                data: new
                {
                    bmi = Math.Round(bmi, 2),
                    assessment,
                    bmr = Math.Round(bmr, 0),
                    tdee = Math.Round(tdee, 0),
                    dailyCaloriesTarget = Math.Round(dailyCalories, 0),
                    macros = new
                    {
                        protein = macros["protein"],
                        carbs = macros["carbs"],
                        fat = macros["fat"]
                    },
                    goal = request.Goal,
                    targetWeight = request.TargetWeight,
                    currentWeight = request.Weight,
                    weeklyGoal = request.WeeklyGoal
                },
                statusCode: HttpStatusCode.OK
            );

            return response.ToActionResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user goals");
            return new ApiResponse<object>(
                success: false,
                message: ex.Message,
                statusCode: HttpStatusCode.BadRequest
            ).ToActionResult();
        }
    }

    /// <summary>
    /// Get user's current BMI, TDEE, and metrics
    /// </summary>
    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics()
    {
        try
        {
            var userId = _userContext.User.userId;
            var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                return new ApiResponse<object>(
                    success: false,
                    message: "Profile not found",
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
                    message: "No BMI data found. Please update your goals first.",
                    statusCode: HttpStatusCode.NotFound
                ).ToActionResult();
            }

            var response = new ApiResponse<object>(
                success: true,
                message: "Successfully retrieved metrics",
                data: new
                {
                    height = bmiRecord.HeightCm,
                    weight = bmiRecord.WeightKg,
                    bmi = Math.Round(bmiRecord.BMI, 2),
                    assessment = bmiRecord.Assessment,
                    goals = bmiRecord.Goal,
                    measuredAt = bmiRecord.MeasuredAt
                },
                statusCode: HttpStatusCode.OK
            );

            return response.ToActionResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting metrics");
            return new ApiResponse<object>(
                success: false,
                message: ex.Message,
                statusCode: HttpStatusCode.BadRequest
            ).ToActionResult();
        }
    }

    #region Helper Methods

    /// <summary>
    /// Calculate BMR using Mifflin-St Jeor Equation
    /// </summary>
    private double CalculateBMR(double weight, double height, int age, string gender)
    {
        // Mifflin-St Jeor Equation
        // Men: BMR = 10W + 6.25H - 5A + 5
        // Women: BMR = 10W + 6.25H - 5A - 161
        var baseBMR = (10 * weight) + (6.25 * height) - (5 * age);
        return gender.ToLower() == "male" ? baseBMR + 5 : baseBMR - 161;
    }

    /// <summary>
    /// Calculate TDEE based on activity level
    /// </summary>
    private double CalculateTDEE(double bmr, string activityLevel)
    {
        var multiplier = activityLevel.ToLower() switch
        {
            "sedentary" => 1.2,      // Little or no exercise
            "light" => 1.375,        // Exercise 1-3 days/week
            "moderate" => 1.55,      // Exercise 3-5 days/week
            "active" => 1.725,       // Exercise 6-7 days/week
            "very_active" => 1.9,    // Hard exercise daily
            _ => 1.55                // Default to moderate
        };

        return bmr * multiplier;
    }

    /// <summary>
    /// Calculate daily calories based on goal
    /// </summary>
    private double CalculateDailyCalories(double tdee, string goal, double weeklyGoal)
    {
        // 1 kg = 7700 calories
        var dailyDeficitOrSurplus = (weeklyGoal * 7700) / 7;

        return goal.ToLower() switch
        {
            "weight_loss" => tdee - dailyDeficitOrSurplus,
            "muscle_gain" => tdee + dailyDeficitOrSurplus,
            "maintenance" => tdee,
            _ => tdee
        };
    }

    /// <summary>
    /// Calculate macro split based on goal
    /// </summary>
    private Dictionary<string, int> CalculateMacros(double dailyCalories, string goal)
    {
        var (proteinRatio, carbsRatio, fatRatio) = goal.ToLower() switch
        {
            "muscle_gain" => (0.30, 0.45, 0.25),    // High protein & carbs
            "weight_loss" => (0.35, 0.30, 0.35),    // High protein, moderate fat
            _ => (0.25, 0.45, 0.30)                 // Balanced
        };

        return new Dictionary<string, int>
        {
            ["protein"] = (int)(dailyCalories * proteinRatio / 4),  // 4 cal/g
            ["carbs"] = (int)(dailyCalories * carbsRatio / 4),      // 4 cal/g
            ["fat"] = (int)(dailyCalories * fatRatio / 9)           // 9 cal/g
        };
    }

    /// <summary>
    /// Get BMI assessment category
    /// </summary>
    private string GetBMIAssessment(double bmi)
    {
        return bmi switch
        {
            < 18.5 => "Underweight",
            >= 18.5 and < 25 => "Normal",
            >= 25 and < 30 => "Overweight",
            >= 30 => "Obese",
            _ => "Unknown"
        };
    }

    #endregion
}

// Request DTOs
public class UpdateGoalsRequest
{
    public double Height { get; set; }        // cm
    public double Weight { get; set; }        // kg
    public int Age { get; set; }
    public string Gender { get; set; }        // Male/Female
    public string ActivityLevel { get; set; } // sedentary, light, moderate, active, very_active
    public string Goal { get; set; }          // weight_loss, maintenance, muscle_gain
    public double TargetWeight { get; set; }  // kg
    public double WeeklyGoal { get; set; }    // kg per week (e.g., 0.5 for weight loss, 0.25 for muscle gain)
}
