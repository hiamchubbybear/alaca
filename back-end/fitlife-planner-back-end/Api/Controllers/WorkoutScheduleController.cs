using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
    public async Task<ApiResponse<List<GetWorkoutScheduleResponseDTO>>> GetMySchedule()
    {
        try
        {
            var schedules = await _scheduleService.GetMySchedule();
            return new ApiResponse<List<GetWorkoutScheduleResponseDTO>>(
                success: true,
                message: "Successfully retrieved workout schedule",
                data: schedules,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<List<GetWorkoutScheduleResponseDTO>>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ApiResponse<GetWorkoutScheduleResponseDTO>> ScheduleWorkout([FromBody] ScheduleWorkoutRequestDTO dto)
    {
        try
        {
            var schedule = await _scheduleService.ScheduleWorkout(dto);
            return new ApiResponse<GetWorkoutScheduleResponseDTO>(
                success: true,
                message: "Successfully scheduled workout",
                data: schedule,
                statusCode: HttpStatusCode.Created
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<GetWorkoutScheduleResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize]
    [HttpPut("{id:guid}/complete")]
    public async Task<ApiResponse<GetWorkoutScheduleResponseDTO>> CompleteWorkout(Guid id)
    {
        try
        {
            var schedule = await _scheduleService.CompleteWorkout(id);
            return new ApiResponse<GetWorkoutScheduleResponseDTO>(
                success: true,
                message: "Successfully marked workout as completed",
                data: schedule,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<GetWorkoutScheduleResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize]
    [HttpPut("{id:guid}/skip")]
    public async Task<ApiResponse<GetWorkoutScheduleResponseDTO>> SkipWorkout(Guid id)
    {
        try
        {
            var schedule = await _scheduleService.SkipWorkout(id);
            return new ApiResponse<GetWorkoutScheduleResponseDTO>(
                success: true,
                message: "Successfully marked workout as skipped",
                data: schedule,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<GetWorkoutScheduleResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }
}
