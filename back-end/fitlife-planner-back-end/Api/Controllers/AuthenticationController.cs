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
using fitlife_planner_back_end.Api.DTOs.Requests;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;

namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthenticationController(
    AuthenticationService authService,
    PasswordResetService passwordResetService,
    ILogger<AuthenticationController> logger)
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

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto dto)
    {
        try
        {
            await passwordResetService.GenerateResetToken(dto.Email);

            // Always return success for security (don't reveal if email exists)
            var response = new ApiResponse<object>(
                success: true,
                statusCode: HttpStatusCode.OK,
                message: "If an account with that email exists, a password reset link has been sent."
            );
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error in forgot password");
            var response = new ApiResponse<object>(
                success: false,
                statusCode: HttpStatusCode.InternalServerError,
                message: "An error occurred while processing your request"
            );
            return response.ToActionResult();
        }
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto dto)
    {
        try
        {
            var (success, message) = await passwordResetService.ResetPassword(dto.Token, dto.NewPassword);

            var response = new ApiResponse<object>(
                success: success,
                statusCode: success ? HttpStatusCode.OK : HttpStatusCode.BadRequest,
                message: message
            );
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error in reset password");
            var response = new ApiResponse<object>(
                success: false,
                statusCode: HttpStatusCode.InternalServerError,
                message: "An error occurred while resetting your password"
            );
            return response.ToActionResult();
        }
    }

    [HttpPost("verify-reset-token")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyResetToken([FromBody] VerifyResetTokenRequestDto dto)
    {
        try
        {
            var isValid = await passwordResetService.ValidateResetToken(dto.Token);

            var response = new ApiResponse<object>(
                success: true,
                statusCode: HttpStatusCode.OK,
                data: new { isValid },
                message: isValid ? "Token is valid" : "Token is invalid or expired"
            );
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error in verify reset token");
            var response = new ApiResponse<object>(
                success: false,
                statusCode: HttpStatusCode.InternalServerError,
                message: "An error occurred while verifying the token"
            );
            return response.ToActionResult();
        }
    }
}
