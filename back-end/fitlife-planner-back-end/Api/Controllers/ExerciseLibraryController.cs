using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
    public async Task<ApiResponse<List<GetExerciseResponseDTO>>> GetAllExercises([FromQuery] string? muscleGroup = null)
    {
        try
        {
            var exercises = await _exerciseService.GetAllExercises(muscleGroup);
            return new ApiResponse<List<GetExerciseResponseDTO>>(
                success: true,
                message: "Successfully retrieved exercises",
                data: exercises,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<List<GetExerciseResponseDTO>>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<GetExerciseResponseDTO>> GetExerciseById(Guid id)
    {
        try
        {
            var exercise = await _exerciseService.GetExerciseById(id);
            return new ApiResponse<GetExerciseResponseDTO>(
                success: true,
                message: "Successfully retrieved exercise",
                data: exercise,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<GetExerciseResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.NotFound
            );
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ApiResponse<GetExerciseResponseDTO>> CreateExercise([FromBody] CreateExerciseRequestDTO dto)
    {
        try
        {
            var exercise = await _exerciseService.CreateExercise(dto);
            return new ApiResponse<GetExerciseResponseDTO>(
                success: true,
                message: "Successfully created exercise",
                data: exercise,
                statusCode: HttpStatusCode.Created
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<GetExerciseResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<ApiResponse<bool>> DeleteExercise(Guid id)
    {
        try
        {
            var result = await _exerciseService.DeleteExercise(id);
            return new ApiResponse<bool>(
                success: true,
                message: "Successfully deleted exercise",
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
