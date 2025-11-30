using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("workouts")]
public class WorkoutController : ControllerBase
{
    private readonly WorkoutService _workoutService;
    private readonly ILogger<WorkoutController> _logger;

    public WorkoutController(WorkoutService workoutService, ILogger<WorkoutController> logger)
    {
        _workoutService = workoutService;
        _logger = logger;
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ApiResponse<List<GetWorkoutResponseDTO>>> GetMyWorkouts()
    {
        try
        {
            var workouts = await _workoutService.GetMyWorkouts();
            return new ApiResponse<List<GetWorkoutResponseDTO>>(
                success: true,
                message: "Successfully retrieved workouts",
                data: workouts,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<List<GetWorkoutResponseDTO>>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<GetWorkoutResponseDTO>> GetWorkoutById(Guid id)
    {
        try
        {
            var workout = await _workoutService.GetWorkoutById(id);
            return new ApiResponse<GetWorkoutResponseDTO>(
                success: true,
                message: "Successfully retrieved workout",
                data: workout,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<GetWorkoutResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.NotFound
            );
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ApiResponse<GetWorkoutResponseDTO>> CreateWorkout([FromBody] CreateWorkoutRequestDTO dto)
    {
        try
        {
            var workout = await _workoutService.CreateWorkout(dto);
            return new ApiResponse<GetWorkoutResponseDTO>(
                success: true,
                message: "Successfully created workout",
                data: workout,
                statusCode: HttpStatusCode.Created
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<GetWorkoutResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<ApiResponse<bool>> DeleteWorkout(Guid id)
    {
        try
        {
            var result = await _workoutService.DeleteWorkout(id);
            return new ApiResponse<bool>(
                success: true,
                message: "Successfully deleted workout",
                data: result,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<bool>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }
}
