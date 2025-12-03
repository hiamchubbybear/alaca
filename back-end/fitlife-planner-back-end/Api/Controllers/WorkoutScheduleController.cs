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
[Route("workout-schedules")]
public class WorkoutScheduleController : ControllerBase
{
    private readonly WorkoutScheduleService _scheduleService;
    private readonly ILogger<WorkoutScheduleController> _logger;

    public WorkoutScheduleController(WorkoutScheduleService scheduleService, ILogger<WorkoutScheduleController> logger)
    {
        _scheduleService = scheduleService;
        _logger = logger;
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMySchedule()
    {
        try
        {
            var schedules = await _scheduleService.GetMySchedule();
            var response = new ApiResponse<List<GetWorkoutScheduleResponseDTO>>(
                success: true,
                message: "Successfully retrieved workout schedule",
                data: schedules,
                statusCode: HttpStatusCode.OK
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<List<GetWorkoutScheduleResponseDTO>>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> ScheduleWorkout([FromBody] ScheduleWorkoutRequestDTO dto)
    {
        try
        {
            var schedule = await _scheduleService.ScheduleWorkout(dto);
            var response = new ApiResponse<GetWorkoutScheduleResponseDTO>(
                success: true,
                message: "Successfully scheduled workout",
                data: schedule,
                statusCode: HttpStatusCode.Created
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetWorkoutScheduleResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpPut("{id:guid}/complete")]
    public async Task<IActionResult> CompleteWorkout(Guid id)
    {
        try
        {
            var schedule = await _scheduleService.CompleteWorkout(id);
            var response = new ApiResponse<GetWorkoutScheduleResponseDTO>(
                success: true,
                message: "Successfully marked workout as completed",
                data: schedule,
                statusCode: HttpStatusCode.OK
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetWorkoutScheduleResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpPut("{id:guid}/skip")]
    public async Task<IActionResult> SkipWorkout(Guid id)
    {
        try
        {
            var schedule = await _scheduleService.SkipWorkout(id);
            var response = new ApiResponse<GetWorkoutScheduleResponseDTO>(
                success: true,
                message: "Successfully marked workout as skipped",
                data: schedule,
                statusCode: HttpStatusCode.OK
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetWorkoutScheduleResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }
}
