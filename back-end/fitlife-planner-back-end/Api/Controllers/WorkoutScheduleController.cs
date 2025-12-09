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
            var response = new ApiResponse<List<GetScheduleResponseDTO>>(
                success: true,
                message: "Successfully retrieved workout schedule",
                data: schedules,
                statusCode: HttpStatusCode.OK
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<List<GetScheduleResponseDTO>>(
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

    [Authorize]
    [HttpPut("{id:guid}/reschedule")]
    public async Task<IActionResult> RescheduleWorkout(Guid id, [FromBody] RescheduleWorkoutRequestDTO dto)
    {
        try
        {
            var schedule = await _scheduleService.RescheduleWorkout(id, dto);
            return new ApiResponse<GetWorkoutScheduleResponseDTO>(success: true, message: "Successfully rescheduled workout", data: schedule, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<GetWorkoutScheduleResponseDTO>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> CancelSchedule(Guid id)
    {
        try
        {
            var result = await _scheduleService.CancelSchedule(id);
            return new ApiResponse<bool>(success: true, message: "Successfully cancelled schedule", data: result, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<bool>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    [Authorize]
    [HttpGet("week")]
    public async Task<IActionResult> GetWeekSchedule([FromQuery] DateTime? startDate = null)
    {
        try
        {
            var schedules = await _scheduleService.GetWeekSchedule(startDate);
            return new ApiResponse<List<GetWorkoutScheduleResponseDTO>>(success: true, message: "Successfully retrieved week schedule", data: schedules, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<List<GetWorkoutScheduleResponseDTO>>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    /*
    /// <summary>
    /// Generate weekly workout plan based on user's BMI record
    /// </summary>
    [Authorize]
    [HttpPost("generate-weekly-plan")]
    public async Task<IActionResult> GenerateWeeklyPlan([FromQuery] int? weekNumber = null)
    {
        try
        {
            var week = weekNumber ?? 1;
            var schedules = await _scheduleService.GenerateWeeklyPlan(week);
            return new ApiResponse<object>(
                success: true,
                message: $"Successfully generated workout plan for week {week}",
                data: new
                {
                    weekNumber = week,
                    sessions = schedules,
                    totalSessions = schedules.Count
                },
                statusCode: HttpStatusCode.Created
            ).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<object>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }
    */

    [Authorize]
    [HttpPost("custom-week")]
    public async Task<IActionResult> CreateCustomWeeklySchedule([FromBody] CreateCustomScheduleRequestDTO dto)
    {
        try
        {
            var result = await _scheduleService.CreateCustomWeeklySchedule(dto);
             return new ApiResponse<List<GetScheduleResponseDTO>>(success: true, message: "Successfully created custom weekly schedule", data: result, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
             return new ApiResponse<List<GetScheduleResponseDTO>>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }
}
