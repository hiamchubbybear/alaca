using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Extensions;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Util;
using fitlife_planner_back_end.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace fitlife_planner_back_end.Api.Controllers;

[Route("account")]
[ApiController]
public class AccountController(ILogger<AccountController> logger, UserService userService) : ControllerBase
{
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetUser()
    {
        try
        {
            var userResponse = await userService.GetUser();
            if (userResponse != null)
            {
                var response = new ApiResponse<User>(success: true, message: "Successfully retrieved user",
                    statusCode: HttpStatusCode.OK, data: userResponse);
                return response.ToActionResult();
            }
            var errorResponse = new ApiResponse<User>(success: false, message: "Failed to find user",
                statusCode: HttpStatusCode.BadRequest);
            return errorResponse.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<User>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
            return response.ToActionResult();
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateAccountRequestDto user)
    {
        try
        {
            var userResponse = await userService.CreateUser(user);
            var response = new ApiResponse<CreateAccountRequestDto>(success: true, message: "Successfully created user",
                data: userResponse,
                statusCode: HttpStatusCode.Created);
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<CreateAccountRequestDto>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
            return response.ToActionResult();
        }
    }

    [HttpPost("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateAdminUser([FromBody] CreateAccountRequestDto user)
    {
        try
        {
            var userResponse = await userService.CreateAdminUser(user);
            var response = new ApiResponse<CreateAccountRequestDto>(success: true, message: "Successfully created admin user",
                data: userResponse,
                statusCode: HttpStatusCode.Created);
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<CreateAccountRequestDto>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
            return response.ToActionResult();
        }
    }

    [HttpPost("admin/first")]
    public async Task<IActionResult> CreateFirstAdmin([FromBody] CreateAccountRequestDto user)
    {
        try
        {
            // Check if any admin exists
            var adminExists = await userService.AdminExists();
            if (adminExists)
            {
                return new ApiResponse<object>(
                    success: false,
                    message: "Admin already exists. Use /account/admin endpoint with admin authorization.",
                    statusCode: HttpStatusCode.Forbidden
                ).ToActionResult();
            }

            var userResponse = await userService.CreateAdminUser(user);
            var response = new ApiResponse<CreateAccountRequestDto>(
                success: true,
                message: "Successfully created first admin user",
                data: userResponse,
                statusCode: HttpStatusCode.Created
            );
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<CreateAccountRequestDto>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
            return response.ToActionResult();
        }
    }

    // ADMIN TOOLS
    [Authorize(Roles = "Admin")]
    [HttpGet("admin/users")]
    public async Task<IActionResult> GetAllUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var users = await userService.GetAllUsers(page, pageSize);
            return new ApiResponse<object>(success: true, message: "Successfully retrieved users", data: users, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<object>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("admin/users/{id:guid}/ban")]
    public async Task<IActionResult> BanUser(Guid id)
    {
        try
        {
            var result = await userService.BanUser(id);
            return new ApiResponse<bool>(success: true, message: "User banned successfully", data: result, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<bool>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("admin/users/{id:guid}/unban")]
    public async Task<IActionResult> UnbanUser(Guid id)
    {
        try
        {
            var result = await userService.UnbanUser(id);
            return new ApiResponse<bool>(success: true, message: "User unbanned successfully", data: result, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<bool>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("admin/users/{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        try
        {
            var result = await userService.DeleteUser(id);
            return new ApiResponse<bool>(success: true, message: "Successfully deleted user", data: result, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<bool>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin/stats")]
    public async Task<IActionResult> GetPlatformStats()
    {
        try
        {
            var stats = await userService.GetPlatformStats();
            return new ApiResponse<object>(success: true, message: "Successfully retrieved platform stats", data: stats, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<object>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin/notifications")]
    public async Task<IActionResult> GetNotificationHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var service = HttpContext.RequestServices.GetService<fitlife_planner_back_end.Api.Services.NotificationService>();
            var (notifications, total) = await service.GetNotificationHistory(page, pageSize);

            return new ApiResponse<object>(
                success: true,
                message: "Successfully retrieved notification history",
                data: new { notifications, total },
                statusCode: HttpStatusCode.OK
            ).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<object>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("admin/notifications")]
    public async Task<IActionResult> SendSystemNotification([FromBody] CreateNotificationRequestDTO dto)
    {
        try
        {
            var service = HttpContext.RequestServices.GetService<fitlife_planner_back_end.Api.Services.NotificationService>();
            await service.CreateNotification(dto);

            return new ApiResponse<bool>(
                success: true,
                message: "Successfully sent notification",
                data: true,
                statusCode: HttpStatusCode.OK
            ).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<bool>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    // ACCOUNT MANAGEMENT
    [Authorize]
    [HttpPut("")]
    public async Task<IActionResult> UpdateAccount([FromBody] UpdateAccountRequestDTO dto)
    {
        try
        {
            var user = await userService.UpdateAccount(dto);
            return new ApiResponse<object>(success: true, message: "Successfully updated account", data: user, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<object>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    [Authorize]
    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDTO dto)
    {
        try
        {
            var result = await userService.ChangePassword(dto);
            return new ApiResponse<bool>(success: true, message: "Successfully changed password", data: result, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<bool>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    [Authorize]
    [HttpDelete("")]
    public async Task<IActionResult> DeleteAccount()
    {
        try
        {
            var result = await userService.DeleteAccount();
            return new ApiResponse<bool>(success: true, message: "Successfully deleted account", data: result, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<bool>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }
}
