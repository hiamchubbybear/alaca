using System.Net;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.Middlewares;
using Microsoft.AspNetCore.Mvc;
using fitlife_planner_back_end.Api.Extensions;

using Microsoft.EntityFrameworkCore;
using APIResponseWrapper;
using fitlife_planner_back_end.Application.Services;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;

namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthenticationController(AuthenticationService authService, ILogger<AuthenticationController> logger)
    : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
    {
        if (!ModelState.IsValid)
        {
            var validationResponse = new ApiResponse<AuthenticationResponseDto>(
                success: false,
                statusCode: HttpStatusCode.BadRequest,
                message: "Email and password are required"
            );
            return validationResponse.ToActionResult();
        }

        try
        {
            var token = await authService.Authenticate(loginRequest);
            var response = new ApiResponse<AuthenticationResponseDto>(
                success: true,
                statusCode: HttpStatusCode.OK,
                data: token,
                message: "Login successful"
            );
            return response.ToActionResult();
        }
        catch (UnauthorizedAccessException ex)
        {
            var response = new ApiResponse<AuthenticationResponseDto>(
                success: false,
                statusCode: HttpStatusCode.Unauthorized,
                message: ex.Message
            );
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<AuthenticationResponseDto>(
                success: false,
                statusCode: HttpStatusCode.InternalServerError,
                message: "Unknown error " + e.Message
            );
            return response.ToActionResult();
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(
        [FromBody] RefreshTokenRequestDto refreshTokenRequestDto)
    {
        try
        {
            logger.LogInformation("Refreshing token");
            var refreshToken = await authService.RefreshToken(refreshTokenRequestDto);
            var response = new ApiResponse<AuthenticationResponseDto>(
                success: true,
                statusCode: HttpStatusCode.Created,
                message: "Successfully refreshed the token"
                , data: refreshToken
            );
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            logger.LogInformation(e.StackTrace);
            var response = new ApiResponse<AuthenticationResponseDto>(
                success: false,
                statusCode: HttpStatusCode.InternalServerError,
                message: e.Message
            );
            return response.ToActionResult();
        }
    }
}
