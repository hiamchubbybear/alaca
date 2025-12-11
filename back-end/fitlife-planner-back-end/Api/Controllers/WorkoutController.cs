using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Requests;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using fitlife_planner_back_end.Api.Extensions;


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
    public async Task<IActionResult> GetMyWorkouts([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var workouts = await _workoutService.GetMyWorkouts(page, pageSize);
            var response = new ApiResponse<List<GetWorkoutResponseDTO>>(
                success: true,
                message: "Successfully retrieved workouts",
                data: workouts,
                statusCode: HttpStatusCode.OK
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<List<GetWorkoutResponseDTO>>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetWorkoutById(Guid id)
    {
        try
        {
            var workout = await _workoutService.GetWorkoutById(id);
            var response = new ApiResponse<GetWorkoutResponseDTO>(
                success: true,
                message: "Successfully retrieved workout",
                data: workout,
                statusCode: HttpStatusCode.OK
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetWorkoutResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.NotFound
            );;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateWorkout([FromBody] CreateWorkoutRequestDTO dto)
    {
        try
        {
            var workout = await _workoutService.CreateWorkout(dto);
            var response = new ApiResponse<GetWorkoutResponseDTO>(
                success: true,
                message: "Successfully created workout",
                data: workout,
                statusCode: HttpStatusCode.Created
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetWorkoutResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteWorkout(Guid id)
    {
        try
        {
            var result = await _workoutService.DeleteWorkout(id);
            var response = new ApiResponse<bool>(
                success: true,
                message: "Successfully deleted workout",
                data: result,
                statusCode: HttpStatusCode.OK
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<bool>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateWorkout(Guid id, [FromBody] UpdateWorkoutRequestDTO dto)
    {
        try
        {
            var workout = await _workoutService.UpdateWorkout(id, dto);
            return new ApiResponse<GetWorkoutResponseDTO>(success: true, message: "Successfully updated workout", data: workout, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<GetWorkoutResponseDTO>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    // ==================== WORKOUT SCHEDULE ENDPOINTS ====================

    [Authorize]
    [HttpGet("today")]
    public async Task<IActionResult> GetTodayWorkout()
    {
        try
        {
            var workout = await _workoutService.GetTodayWorkout();

            if (workout == null)
            {
                return new ApiResponse<WorkoutScheduleResponseDTO>(
                    success: false,
                    message: "No workout scheduled for today",
                    statusCode: HttpStatusCode.NotFound
                ).ToActionResult();
            }

            return new ApiResponse<WorkoutScheduleResponseDTO>(
                success: true,
                message: "Successfully retrieved today's workout",
                data: workout,
                statusCode: HttpStatusCode.OK
            ).ToActionResult();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting today's workout");
            return new ApiResponse<WorkoutScheduleResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            ).ToActionResult();
        }
    }

    [Authorize]
    [HttpGet("latest")]
    public async Task<IActionResult> GetLatestWorkout()
    {
        try
        {
            var workout = await _workoutService.GetLatestWorkout();

            if (workout == null)
            {
                return new ApiResponse<WorkoutScheduleResponseDTO>(
                    success: false,
                    message: "No workout found",
                    statusCode: HttpStatusCode.NotFound
                ).ToActionResult();
            }

            return new ApiResponse<WorkoutScheduleResponseDTO>(
                success: true,
                message: "Successfully retrieved latest workout",
                data: workout,
                statusCode: HttpStatusCode.OK
            ).ToActionResult();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting latest workout");
            return new ApiResponse<WorkoutScheduleResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            ).ToActionResult();
        }
    }

    [Authorize]
    [HttpGet("schedules/{scheduleId:guid}")]
    public async Task<IActionResult> GetWorkoutSchedule(Guid scheduleId)
    {
        try
        {
            var workout = await _workoutService.GetWorkoutSchedule(scheduleId);

            if (workout == null)
            {
                return new ApiResponse<WorkoutScheduleResponseDTO>(
                    success: false,
                    message: "Workout schedule not found",
                    statusCode: HttpStatusCode.NotFound
                ).ToActionResult();
            }

            return new ApiResponse<WorkoutScheduleResponseDTO>(
                success: true,
                message: "Successfully retrieved workout schedule",
                data: workout,
                statusCode: HttpStatusCode.OK
            ).ToActionResult();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting workout schedule {ScheduleId}", scheduleId);
            return new ApiResponse<WorkoutScheduleResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            ).ToActionResult();
        }
    }

    [Authorize]
    [HttpPost("complete")]
    public async Task<IActionResult> CompleteWorkout([FromBody] CompleteWorkoutRequestDTO request)
    {
        try
        {
            var success = await _workoutService.CompleteWorkout(request);

            if (!success)
            {
                return new ApiResponse<object>(
                    success: false,
                    message: "Failed to mark workout as completed",
                    statusCode: HttpStatusCode.BadRequest
                ).ToActionResult();
            }

            return new ApiResponse<object>(
                success: true,
                message: "Workout marked as completed successfully",
                statusCode: HttpStatusCode.OK
            ).ToActionResult();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error completing workout");
            return new ApiResponse<object>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            ).ToActionResult();
        }
    }

    [Authorize]
    [HttpGet("history")]
    public async Task<IActionResult> GetWorkoutHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var history = await _workoutService.GetWorkoutHistory(page, pageSize);

            return new ApiResponse<List<WorkoutScheduleResponseDTO>>(
                success: true,
                message: "Successfully retrieved workout history",
                data: history,
                statusCode: HttpStatusCode.OK
            ).ToActionResult();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting workout history");
            return new ApiResponse<List<WorkoutScheduleResponseDTO>>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            ).ToActionResult();
        }
    }

    [Authorize]
    [HttpGet("stats")]
    public async Task<IActionResult> GetWorkoutStats()
    {
        try
        {
            var stats = await _workoutService.GetWorkoutStats();

            return new ApiResponse<WorkoutStatsResponseDTO>(
                success: true,
                message: "Successfully retrieved workout stats",
                data: stats,
                statusCode: HttpStatusCode.OK
            ).ToActionResult();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting workout stats");
            return new ApiResponse<WorkoutStatsResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            ).ToActionResult();
        }
    }
}
