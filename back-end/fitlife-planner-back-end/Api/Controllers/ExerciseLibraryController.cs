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
[Route("exercises")]
public class ExerciseLibraryController : ControllerBase
{
    private readonly ExerciseLibraryService _exerciseService;
    private readonly ILogger<ExerciseLibraryController> _logger;

    public ExerciseLibraryController(ExerciseLibraryService exerciseService, ILogger<ExerciseLibraryController> logger)
    {
        _exerciseService = exerciseService;
        _logger = logger;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAllExercises([FromQuery] string? muscleGroup = null)
    {
        try
        {
            var exercises = await _exerciseService.GetAllExercises(muscleGroup);
            var response = new ApiResponse<List<GetExerciseResponseDTO>>(
                success: true,
                message: "Successfully retrieved exercises",
                data: exercises,
                statusCode: HttpStatusCode.OK
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<List<GetExerciseResponseDTO>>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetExerciseById(Guid id)
    {
        try
        {
            var exercise = await _exerciseService.GetExerciseById(id);
            var response = new ApiResponse<GetExerciseResponseDTO>(
                success: true,
                message: "Successfully retrieved exercise",
                data: exercise,
                statusCode: HttpStatusCode.OK
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetExerciseResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.NotFound
            );;

            return response.ToActionResult();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateExercise([FromBody] CreateExerciseRequestDTO dto)
    {
        try
        {
            var exercise = await _exerciseService.CreateExercise(dto);
            var response = new ApiResponse<GetExerciseResponseDTO>(
                success: true,
                message: "Successfully created exercise",
                data: exercise,
                statusCode: HttpStatusCode.Created
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetExerciseResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteExercise(Guid id)
    {
        try
        {
            var result = await _exerciseService.DeleteExercise(id);
            var response = new ApiResponse<bool>(
                success: true,
                message: "Successfully deleted exercise",
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
}
