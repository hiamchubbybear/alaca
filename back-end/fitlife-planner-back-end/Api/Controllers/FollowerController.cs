using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("api/followers")]
[Authorize]
public class FollowerController : ControllerBase
{
    private readonly ILogger<FollowerController> _logger;
    private readonly FollowerService _followerService;

    public FollowerController(ILogger<FollowerController> logger, FollowerService followerService)
    {
        _logger = logger;
        _followerService = followerService;
    }

    /// <summary>
    /// Follow a user
    /// </summary>
    [HttpPost("{userId}/follow")]
    public async Task<ApiResponse<bool>> FollowUser(Guid userId)
    {
        try
        {
            var result = await _followerService.FollowUser(userId);
            return new ApiResponse<bool>(
                success: true,
                message: result ? "Successfully followed user" : "Already following this user",
                data: result,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (InvalidOperationException ex)
        {
            return new ApiResponse<bool>(
                success: false,
                message: ex.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error following user {UserId}", userId);
            return new ApiResponse<bool>(
                success: false,
                message: "Failed to follow user",
                statusCode: HttpStatusCode.InternalServerError
            );
        }
    }

    /// <summary>
    /// Unfollow a user
    /// </summary>
    [HttpDelete("{userId}/unfollow")]
    public async Task<ApiResponse<bool>> UnfollowUser(Guid userId)
    {
        try
        {
            var result = await _followerService.UnfollowUser(userId);
            return new ApiResponse<bool>(
                success: true,
                message: result ? "Successfully unfollowed user" : "Not following this user",
                data: result,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unfollowing user {UserId}", userId);
            return new ApiResponse<bool>(
                success: false,
                message: "Failed to unfollow user",
                statusCode: HttpStatusCode.InternalServerError
            );
        }
    }

    /// <summary>
    /// Get followers list (users who follow the specified user)
    /// </summary>
    [HttpGet("followers")]
    public async Task<ApiResponse<List<FollowerResponseDTO>>> GetFollowers(
        [FromQuery] Guid? userId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var followers = await _followerService.GetFollowers(userId, page, pageSize);
            return new ApiResponse<List<FollowerResponseDTO>>(
                success: true,
                message: "Successfully retrieved followers",
                data: followers,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting followers");
            return new ApiResponse<List<FollowerResponseDTO>>(
                success: false,
                message: "Failed to retrieve followers",
                statusCode: HttpStatusCode.InternalServerError
            );
        }
    }

    /// <summary>
    /// Get following list (users that the specified user follows)
    /// </summary>
    [HttpGet("following")]
    public async Task<ApiResponse<List<FollowerResponseDTO>>> GetFollowing(
        [FromQuery] Guid? userId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var following = await _followerService.GetFollowing(userId, page, pageSize);
            return new ApiResponse<List<FollowerResponseDTO>>(
                success: true,
                message: "Successfully retrieved following list",
                data: following,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting following list");
            return new ApiResponse<List<FollowerResponseDTO>>(
                success: false,
                message: "Failed to retrieve following list",
                statusCode: HttpStatusCode.InternalServerError
            );
        }
    }

    /// <summary>
    /// Get follower statistics for a user
    /// </summary>
    [HttpGet("stats")]
    public async Task<ApiResponse<FollowerStatsDTO>> GetFollowerStats([FromQuery] Guid? userId = null)
    {
        try
        {
            var stats = await _followerService.GetFollowerStats(userId);
            return new ApiResponse<FollowerStatsDTO>(
                success: true,
                message: "Successfully retrieved follower stats",
                data: stats,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting follower stats");
            return new ApiResponse<FollowerStatsDTO>(
                success: false,
                message: "Failed to retrieve follower stats",
                statusCode: HttpStatusCode.InternalServerError
            );
        }
    }

    /// <summary>
    /// Get mutual followers between current user and target user
    /// </summary>
    [HttpGet("{userId}/mutual")]
    public async Task<ApiResponse<List<FollowerResponseDTO>>> GetMutualFollowers(Guid userId)
    {
        try
        {
            var mutualFollowers = await _followerService.GetMutualFollowers(userId);
            return new ApiResponse<List<FollowerResponseDTO>>(
                success: true,
                message: "Successfully retrieved mutual followers",
                data: mutualFollowers,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting mutual followers");
            return new ApiResponse<List<FollowerResponseDTO>>(
                success: false,
                message: "Failed to retrieve mutual followers",
                statusCode: HttpStatusCode.InternalServerError
            );
        }
    }

    /// <summary>
    /// Get smart follow suggestions based on mutual connections and popularity
    /// </summary>
    [HttpGet("suggestions")]
    public async Task<ApiResponse<List<FollowSuggestionDTO>>> GetFollowSuggestions([FromQuery] int limit = 10)
    {
        try
        {
            var suggestions = await _followerService.GetFollowSuggestions(limit);
            return new ApiResponse<List<FollowSuggestionDTO>>(
                success: true,
                message: "Successfully retrieved follow suggestions",
                data: suggestions,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting follow suggestions");
            return new ApiResponse<List<FollowSuggestionDTO>>(
                success: false,
                message: "Failed to retrieve follow suggestions",
                statusCode: HttpStatusCode.InternalServerError
            );
        }
    }
}
