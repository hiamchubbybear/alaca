using System.Net;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.Middlewares;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using APIResponseWrapper;
using fitlife_planner_back_end.Application.Services;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;

namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthenticationController : ControllerBase
{
    private readonly AuthenticationService _authService;
    private readonly ILogger<AuthenticationController> _logger;

    public AuthenticationController(AuthenticationService authService, ILogger<AuthenticationController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ApiResponse<AuthenticationResponseDto>> Login([FromBody] LoginRequestDto loginRequest)
    {
        if (!ModelState.IsValid)
        {
            return new ApiResponse<AuthenticationResponseDto>(
                success: false,
                statusCode: HttpStatusCode.BadRequest,
                message: "Email and password are required"
            );
        }

        try
        {
            var token = await _authService.Authenticate(loginRequest);
            return new ApiResponse<AuthenticationResponseDto>(
                success: true,
                statusCode: HttpStatusCode.OK,
                data: token,
                message: "Login successful"
            );
        }
        catch (UnauthorizedAccessException ex)
        {
            return new ApiResponse<AuthenticationResponseDto>(
                success: false,
                statusCode: HttpStatusCode.Unauthorized,
                message: ex.Message
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<AuthenticationResponseDto>(
                success: false,
                statusCode: HttpStatusCode.InternalServerError,
                message: "Unknown error " + e.Message
            );
        }
    }

    [HttpPost("refresh")]
    public async Task<ApiResponse<AuthenticationResponseDto>> Refresh(
        [FromBody] RefreshTokenRequestDto refreshTokenRequestDto)
    {
        try
        {
            _logger.LogInformation("Refreshing token");
            var refreshToken = await _authService.RefreshToken(refreshTokenRequestDto);
            return new ApiResponse<AuthenticationResponseDto>(
                success: true,
                statusCode: HttpStatusCode.Created,
                message: "Successfully refreshed the token"
                , data: refreshToken
            );
        }
        catch (Exception e)
        {
            _logger.LogInformation(e.StackTrace);
            return new ApiResponse<AuthenticationResponseDto>(
                success: false,
                statusCode: HttpStatusCode.InternalServerError,
                message: e.Message
            );
        }
    }
}