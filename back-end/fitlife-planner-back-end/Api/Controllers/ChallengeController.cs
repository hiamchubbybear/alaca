using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("challenges")]
public class ChallengeController : ControllerBase
{
    private readonly ChallengeService _challengeService;
    private readonly ILogger<ChallengeController> _logger;

    public ChallengeController(ChallengeService challengeService, ILogger<ChallengeController> logger)
    {
        _challengeService = challengeService;
        _logger = logger;
    }

    [Authorize]
    [HttpGet]
    public async Task<ApiResponse<List<GetChallengeResponseDTO>>> GetAllChallenges()
    {
        try
        {
            var challenges = await _challengeService.GetAllChallenges();
            return new ApiResponse<List<GetChallengeResponseDTO>>(
                success: true,
                message: "Successfully retrieved challenges",
                data: challenges,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<List<GetChallengeResponseDTO>>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<GetChallengeResponseDTO>> GetChallengeById(Guid id)
    {
        try
        {
            var challenge = await _challengeService.GetChallengeById(id);
            return new ApiResponse<GetChallengeResponseDTO>(
                success: true,
                message: "Successfully retrieved challenge",
                data: challenge,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<GetChallengeResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.NotFound
            );
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ApiResponse<GetChallengeResponseDTO>> CreateChallenge([FromBody] CreateChallengeRequestDTO dto)
    {
        try
        {
            var challenge = await _challengeService.CreateChallenge(dto);
            return new ApiResponse<GetChallengeResponseDTO>(
                success: true,
                message: "Successfully created challenge",
                data: challenge,
                statusCode: HttpStatusCode.Created
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<GetChallengeResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize]
    [HttpPost("{id:guid}/join")]
    public async Task<ApiResponse<bool>> JoinChallenge(Guid id)
    {
        try
        {
            var result = await _challengeService.JoinChallenge(id);
            return new ApiResponse<bool>(
                success: true,
                message: "Successfully joined challenge",
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

    [Authorize]
    [HttpPut("{id:guid}/progress")]
    public async Task<ApiResponse<bool>> UpdateChallengeProgress(Guid id, [FromBody] UpdateChallengeProgressRequestDTO dto)
    {
        try
        {
            var result = await _challengeService.UpdateChallengeProgress(id, dto);
            return new ApiResponse<bool>(
                success: true,
                message: "Successfully updated challenge progress",
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
