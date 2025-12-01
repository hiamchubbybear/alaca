using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("api/recommendations")]
[Authorize]
public class RecommendationController : ControllerBase
{
    private readonly ILogger<RecommendationController> _logger;
    private readonly RecommendationService _recommendationService;

    public RecommendationController(
        ILogger<RecommendationController> logger,
        RecommendationService recommendationService)
    {
        _logger = logger;
        _recommendationService = recommendationService;
    }

    /// <summary>
    /// Get meal recommendations based on target calories and meal type
    /// </summary>
    [HttpGet("meals")]
    public async Task<ApiResponse<List<FoodRecommendationDTO>>> GetMealRecommendations(
        [FromQuery] double targetCalories,
        [FromQuery] string mealType = "breakfast",
        [FromQuery] int limit = 10)
    {
        try
        {
            var recommendations = await _recommendationService.RecommendMeals(
                targetCalories, mealType, limit);

            return new ApiResponse<List<FoodRecommendationDTO>>(
                success: true,
                message: $"Successfully retrieved {recommendations.Count} meal recommendations",
                data: recommendations,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting meal recommendations");
            return new ApiResponse<List<FoodRecommendationDTO>>(
                success: false,
                message: "Failed to get meal recommendations",
                statusCode: HttpStatusCode.InternalServerError
            );
        }
    }

    /// <summary>
    /// Get workout recommendations based on user's BMI, goal, and fitness level
    /// </summary>
    [HttpGet("workouts")]
    public async Task<ApiResponse<List<WorkoutRecommendationDTO>>> GetWorkoutRecommendations(
        [FromQuery] double bmi,
        [FromQuery] string goal = "maintenance",
        [FromQuery] string fitnessLevel = "intermediate",
        [FromQuery] int limit = 5)
    {
        try
        {
            var recommendations = await _recommendationService.RecommendWorkouts(
                bmi, goal, fitnessLevel, limit);

            return new ApiResponse<List<WorkoutRecommendationDTO>>(
                success: true,
                message: $"Successfully retrieved {recommendations.Count} workout recommendations",
                data: recommendations,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting workout recommendations");
            return new ApiResponse<List<WorkoutRecommendationDTO>>(
                success: false,
                message: "Failed to get workout recommendations",
                statusCode: HttpStatusCode.InternalServerError
            );
        }
    }

    /// <summary>
    /// Get personalized daily plan (meals + workouts) based on user profile
    /// </summary>
    [HttpGet("personalized-plan")]
    public async Task<ApiResponse<PersonalizedPlanDTO>> GetPersonalizedPlan()
    {
        try
        {
            var plan = await _recommendationService.GetPersonalizedPlan();

            return new ApiResponse<PersonalizedPlanDTO>(
                success: true,
                message: "Successfully generated personalized plan",
                data: plan,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating personalized plan");
            return new ApiResponse<PersonalizedPlanDTO>(
                success: false,
                message: ex.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    /// <summary>
    /// Get daily fitness/nutrition tip
    /// </summary>
    [HttpGet("daily-tip")]
    public async Task<ApiResponse<DailyTipDTO>> GetDailyTip()
    {
        try
        {
            var tip = await _recommendationService.GetDailyTip();

            return new ApiResponse<DailyTipDTO>(
                success: true,
                message: "Successfully retrieved daily tip",
                data: tip,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting daily tip");
            return new ApiResponse<DailyTipDTO>(
                success: false,
                message: "Failed to get daily tip",
                statusCode: HttpStatusCode.InternalServerError
            );
        }
    }
}
