using System.Net;
using APIResponseWrapper;
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

    [Authorize]
    [HttpPost("{id:guid}/duplicate")]
    public async Task<IActionResult> DuplicateWorkout(Guid id)
    {
        try
        {
            var workout = await _workoutService.DuplicateWorkout(id);
            return new ApiResponse<GetWorkoutResponseDTO>(success: true, message: "Successfully duplicated workout", data: workout, statusCode: HttpStatusCode.Created).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<GetWorkoutResponseDTO>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }
}
