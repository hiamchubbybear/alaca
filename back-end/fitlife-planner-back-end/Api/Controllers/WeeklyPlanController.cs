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
[Authorize]
public class WeeklyPlanController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IUserContext _userContext;
    private readonly ILogger<WeeklyPlanController> _logger;

    public WeeklyPlanController(
        AppDbContext db,
        IUserContext userContext,
        ILogger<WeeklyPlanController> logger)
    {
        _db = db;
        _userContext = userContext;
        _logger = logger;
    }

    /// <summary>
    /// Create weekly workout plan
    /// </summary>
    [HttpPost("workout-plans/weekly")]
    public async Task<IActionResult> CreateWeeklyWorkoutPlan([FromBody] CreateWeeklyWorkoutRequest request)
    {
        try
        {
            var userId = _userContext.User.userId;

            // Create workout for each day
            foreach (var day in request.WorkoutDays)
            {
                var workout = new Workout
                {
                    Id = Guid.NewGuid(),
                    OwnerUserId = userId,
                    Title = $"{day.DayOfWeek} Workout - Week of {request.WeekStartDate:MM/dd}",
                    Description = $"Workout plan for {day.DayOfWeek}",
                    Intensity = "moderate",
                    CreatedAt = DateTime.UtcNow
                };

                await _db.Workouts.AddAsync(workout);

                // Add exercises to workout
                foreach (var exerciseItem in day.Exercises)
                {
                    var workoutExercise = new WorkoutExercise
                    {
                        Id = Guid.NewGuid(),
                        WorkoutId = workout.Id,
                        ExerciseId = exerciseItem.ExerciseId,
                        Sets = exerciseItem.Sets,
                        Reps = exerciseItem.Reps,
                        RestSeconds = exerciseItem.RestSeconds,
                        OrderIndex = day.Exercises.IndexOf(exerciseItem)
                    };

                    await _db.WorkoutExercises.AddAsync(workoutExercise);
                }

                // Schedule the workout
                var scheduleDate = GetDateForDayOfWeek(request.WeekStartDate, day.DayOfWeek);
                var schedule = new WorkoutSchedule
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    WorkoutId = workout.Id,
                    ScheduledDate = scheduleDate,
                    Status = "planned",
                    CreatedAt = DateTime.UtcNow
                };

                await _db.WorkoutSchedules.AddAsync(schedule);
            }

            await _db.SaveChangesAsync();

            var response = new ApiResponse<object>(
                success: true,
                message: "Successfully created weekly workout plan",
                data: new
                {
                    weekStart = request.WeekStartDate,
                    daysScheduled = request.WorkoutDays.Count,
                    totalExercises = request.WorkoutDays.Sum(d => d.Exercises.Count)
                },
                statusCode: HttpStatusCode.Created
            );

            return response.ToActionResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating weekly workout plan");
            return new ApiResponse<object>(
                success: false,
                message: ex.Message,
                statusCode: HttpStatusCode.BadRequest
            ).ToActionResult();
        }
    }

    /// <summary>
    /// Create weekly nutrition plan
    /// </summary>
    [HttpPost("nutrition-plans/weekly")]
    public async Task<IActionResult> CreateWeeklyNutritionPlan([FromBody] CreateWeeklyNutritionRequest request)
    {
        try
        {
            var userId = _userContext.User.userId;

            // Create nutrition plan
            var plan = new NutritionPlan
            {
                Id = Guid.NewGuid(),
                OwnerUserId = userId,
                Title = $"Meal Plan - Week of {request.WeekStartDate:MM/dd}",
                Description = $"Weekly meal plan targeting {request.TargetDailyCalories} calories/day",
                Macros = System.Text.Json.JsonSerializer.Serialize(new
                {
                    dailyTarget = request.TargetDailyCalories
                }),
                Visibility = "private",
                CreatedAt = DateTime.UtcNow
            };

            await _db.NutritionPlans.AddAsync(plan);

            // Add meals for each day
            foreach (var dailyMeal in request.DailyMeals)
            {
                foreach (var meal in dailyMeal.Meals)
                {
                    foreach (var foodItem in meal.FoodItems)
                    {
                        var planItem = new NutritionPlanItem
                        {
                            Id = Guid.NewGuid(),
                            PlanId = plan.Id,
                            FoodItemId = foodItem.FoodId,
                            MealTime = $"{dailyMeal.DayOfWeek} - {meal.MealType}",
                            ServingCount = (decimal)foodItem.Servings,
                            CreatedAt = DateTime.UtcNow
                        };

                        await _db.NutritionPlanItems.AddAsync(planItem);
                    }
                }
            }

            await _db.SaveChangesAsync();

            // Calculate totals
            var totalMeals = request.DailyMeals.Sum(d => d.Meals.Count);
            var totalFoodItems = request.DailyMeals
                .Sum(d => d.Meals.Sum(m => m.FoodItems.Count));

            var response = new ApiResponse<object>(
                success: true,
                message: "Successfully created weekly nutrition plan",
                data: new
                {
                    planId = plan.Id,
                    weekStart = request.WeekStartDate,
                    targetDailyCalories = request.TargetDailyCalories,
                    daysPlanned = request.DailyMeals.Count,
                    totalMeals,
                    totalFoodItems
                },
                statusCode: HttpStatusCode.Created
            );

            return response.ToActionResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating weekly nutrition plan");
            return new ApiResponse<object>(
                success: false,
                message: ex.Message,
                statusCode: HttpStatusCode.BadRequest
            ).ToActionResult();
        }
    }

    #region Helper Methods

    private DateTime GetDateForDayOfWeek(DateTime weekStart, string dayOfWeek)
    {
        var daysToAdd = dayOfWeek.ToLower() switch
        {
            "monday" => 0,
            "tuesday" => 1,
            "wednesday" => 2,
            "thursday" => 3,
            "friday" => 4,
            "saturday" => 5,
            "sunday" => 6,
            _ => 0
        };

        return weekStart.AddDays(daysToAdd);
    }

    #endregion
}

// Request DTOs
public class CreateWeeklyWorkoutRequest
{
    public DateTime WeekStartDate { get; set; }
    public List<WorkoutDay> WorkoutDays { get; set; } = new();
}

public class WorkoutDay
{
    public string DayOfWeek { get; set; }  // Monday, Tuesday, etc.
    public List<WorkoutExerciseItem> Exercises { get; set; } = new();
}

public class WorkoutExerciseItem
{
    public Guid ExerciseId { get; set; }
    public int Sets { get; set; }
    public string Reps { get; set; }  // e.g., "8-12"
    public int RestSeconds { get; set; }
}

public class CreateWeeklyNutritionRequest
{
    public DateTime WeekStartDate { get; set; }
    public int TargetDailyCalories { get; set; }
    public List<DailyMeal> DailyMeals { get; set; } = new();
}

public class DailyMeal
{
    public string DayOfWeek { get; set; }  // Monday, Tuesday, etc.
    public List<Meal> Meals { get; set; } = new();
}

public class Meal
{
    public string MealType { get; set; }  // breakfast, lunch, dinner, snack
    public List<FoodItemEntry> FoodItems { get; set; } = new();
}

public class FoodItemEntry
{
    public Guid FoodId { get; set; }
    public double Servings { get; set; }
}
