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
    public async Task<IActionResult> GetAllChallenges([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var challenges = await _challengeService.GetAllChallenges(page, pageSize);
            var response = new ApiResponse<List<GetChallengeResponseDTO>>(
                success: true,
                message: "Successfully retrieved challenges",
                data: challenges,
                statusCode: HttpStatusCode.OK
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<List<GetChallengeResponseDTO>>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetChallengeById(Guid id)
    {
        try
        {
            var challenge = await _challengeService.GetChallengeById(id);
            var response = new ApiResponse<GetChallengeResponseDTO>(
                success: true,
                message: "Successfully retrieved challenge",
                data: challenge,
                statusCode: HttpStatusCode.OK
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetChallengeResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.NotFound
            );;

            return response.ToActionResult();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateChallenge([FromBody] CreateChallengeRequestDTO dto)
    {
        try
        {
            var challenge = await _challengeService.CreateChallenge(dto);
            var response = new ApiResponse<GetChallengeResponseDTO>(
                success: true,
                message: "Successfully created challenge",
                data: challenge,
                statusCode: HttpStatusCode.Created
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetChallengeResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpPost("{id:guid}/join")]
    public async Task<IActionResult> JoinChallenge(Guid id)
    {
        try
        {
            var result = await _challengeService.JoinChallenge(id);
            var response = new ApiResponse<bool>(
                success: true,
                message: "Successfully joined challenge",
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
    [HttpPut("{id:guid}/progress")]
    public async Task<IActionResult> UpdateChallengeProgress(Guid id, [FromBody] UpdateChallengeProgressRequestDTO dto)
    {
        try
        {
            var result = await _challengeService.UpdateChallengeProgress(id, dto);
            var response = new ApiResponse<bool>(
                success: true,
                message: "Successfully updated challenge progress",
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

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateChallenge(Guid id, [FromBody] UpdateChallengeRequestDTO dto)
    {
        try
        {
            var challenge = await _challengeService.UpdateChallenge(id, dto);
            var response = new ApiResponse<GetChallengeResponseDTO>(
                success: true,
                message: "Successfully updated challenge",
                data: challenge,
                statusCode: HttpStatusCode.OK
            );

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetChallengeResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );

            return response.ToActionResult();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteChallenge(Guid id)
    {
        try
        {
            var result = await _challengeService.DeleteChallenge(id);
            var response = new ApiResponse<bool>(
                success: true,
                message: "Successfully deleted challenge",
                data: result,
                statusCode: HttpStatusCode.OK
            );

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<bool>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpPost("{id:guid}/leave")]
    public async Task<IActionResult> LeaveChallenge(Guid id)
    {
        try
        {
            var result = await _challengeService.LeaveChallenge(id);
            var response = new ApiResponse<bool>(
                success: true,
                message: "Successfully left challenge",
                data: result,
                statusCode: HttpStatusCode.OK
            );

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<bool>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpGet("{id:guid}/leaderboard")]
    public async Task<IActionResult> GetChallengeLeaderboard(Guid id)
    {
        try
        {
            var leaderboard = await _challengeService.GetChallengeLeaderboard(id);
            var response = new ApiResponse<List<ChallengeLeaderboardDTO>>(
                success: true,
                message: "Successfully retrieved leaderboard",
                data: leaderboard,
                statusCode: HttpStatusCode.OK
            );

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<List<ChallengeLeaderboardDTO>>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );

            return response.ToActionResult();
        }
    }
}
