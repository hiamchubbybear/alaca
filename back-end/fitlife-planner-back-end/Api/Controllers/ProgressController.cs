using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("progress")]
public class ProgressController : ControllerBase
{
    private readonly ProgressService _progressService;
    private readonly ILogger<ProgressController> _logger;

    public ProgressController(ProgressService progressService, ILogger<ProgressController> logger)
    {
        _progressService = progressService;
        _logger = logger;
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ApiResponse<List<GetProgressEntryResponseDTO>>> GetMyProgress([FromQuery] string? type = null)
    {
        try
        {
            var entries = await _progressService.GetMyProgress(type);
            return new ApiResponse<List<GetProgressEntryResponseDTO>>(
                success: true,
                message: "Successfully retrieved progress entries",
                data: entries,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<List<GetProgressEntryResponseDTO>>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ApiResponse<GetProgressEntryResponseDTO>> CreateProgressEntry([FromBody] CreateProgressEntryRequestDTO dto)
    {
        try
        {
            var entry = await _progressService.CreateProgressEntry(dto);
            return new ApiResponse<GetProgressEntryResponseDTO>(
                success: true,
                message: "Successfully created progress entry",
                data: entry,
                statusCode: HttpStatusCode.Created
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<GetProgressEntryResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<ApiResponse<bool>> DeleteProgressEntry(Guid id)
    {
        try
        {
            var result = await _progressService.DeleteProgressEntry(id);
            return new ApiResponse<bool>(
                success: true,
                message: "Successfully deleted progress entry",
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
