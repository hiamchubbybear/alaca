using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using fitlife_planner_back_end.Api.Extensions;


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
    public async Task<IActionResult> GetMealRecommendations(
        [FromQuery] double targetCalories,
        [FromQuery] string mealType = "breakfast",
        [FromQuery] int limit = 10)
    {
        try
        {
            var recommendations = await _recommendationService.RecommendMeals(
                targetCalories, mealType, limit);

            var response = new ApiResponse<List<FoodRecommendationDTO>>(
                success: true,
                message: $"Successfully retrieved {recommendations.Count} meal recommendations",
                data: recommendations,
                statusCode: HttpStatusCode.OK
            );;


            return response.ToActionResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting meal recommendations");
            var response = new ApiResponse<List<FoodRecommendationDTO>>(
                success: false,
                message: "Failed to get meal recommendations",
                statusCode: HttpStatusCode.InternalServerError
            );;

            return response.ToActionResult();
        }
    }

    /// <summary>
    /// Get workout recommendations based on user's BMI, goal, and fitness level
    /// </summary>
    [HttpGet("workouts")]
    public async Task<IActionResult> GetWorkoutRecommendations(
        [FromQuery] double bmi,
        [FromQuery] string goal = "maintenance",
        [FromQuery] string fitnessLevel = "intermediate",
        [FromQuery] int limit = 5)
    {
        try
        {
            var recommendations = await _recommendationService.RecommendWorkouts(
                bmi, goal, fitnessLevel, limit);

            var response = new ApiResponse<List<WorkoutRecommendationDTO>>(
                success: true,
                message: $"Successfully retrieved {recommendations.Count} workout recommendations",
                data: recommendations,
                statusCode: HttpStatusCode.OK
            );;


            return response.ToActionResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting workout recommendations");
            var response = new ApiResponse<List<WorkoutRecommendationDTO>>(
                success: false,
                message: "Failed to get workout recommendations",
                statusCode: HttpStatusCode.InternalServerError
            );;

            return response.ToActionResult();
        }
    }

    /// <summary>
    /// Get personalized daily plan (meals + workouts) based on user profile
    /// </summary>
    [HttpGet("personalized-plan")]
    public async Task<IActionResult> GetPersonalizedPlan()
    {
        try
        {
            var plan = await _recommendationService.GetPersonalizedPlan();

            var response = new ApiResponse<PersonalizedPlanDTO>(
                success: true,
                message: "Successfully generated personalized plan",
                data: plan,
                statusCode: HttpStatusCode.OK
            );;


            return response.ToActionResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating personalized plan");
            var response = new ApiResponse<PersonalizedPlanDTO>(
                success: false,
                message: ex.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    /// <summary>
    /// Get daily fitness/nutrition tip
    /// </summary>
    [HttpGet("daily-tip")]
    public async Task<IActionResult> GetDailyTip()
    {
        try
        {
            var tip = await _recommendationService.GetDailyTip();

            var response = new ApiResponse<DailyTipDTO>(
                success: true,
                message: "Successfully retrieved daily tip",
                data: tip,
                statusCode: HttpStatusCode.OK
            );;


            return response.ToActionResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting daily tip");
            var response = new ApiResponse<DailyTipDTO>(
                success: false,
                message: "Failed to get daily tip",
                statusCode: HttpStatusCode.InternalServerError
            );;

            return response.ToActionResult();
        }
    }
}
