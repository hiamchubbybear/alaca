using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("notifications")]
public class NotificationController : ControllerBase
{
    private readonly NotificationService _notificationService;
    private readonly ILogger<NotificationController> _logger;

    public NotificationController(NotificationService notificationService, ILogger<NotificationController> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ApiResponse<List<GetNotificationResponseDTO>>> GetMyNotifications()
    {
        try
        {
            var notifications = await _notificationService.GetMyNotifications();
            return new ApiResponse<List<GetNotificationResponseDTO>>(
                success: true,
                message: "Successfully retrieved notifications",
                data: notifications,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<List<GetNotificationResponseDTO>>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize]
    [HttpPut("{id:guid}/read")]
    public async Task<ApiResponse<bool>> MarkAsRead(Guid id)
    {
        try
        {
            var result = await _notificationService.MarkAsRead(id);
            return new ApiResponse<bool>(
                success: true,
                message: "Successfully marked notification as read",
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
    [HttpPut("read-all")]
    public async Task<ApiResponse<bool>> MarkAllAsRead()
    {
        try
        {
            var result = await _notificationService.MarkAllAsRead();
            return new ApiResponse<bool>(
                success: true,
                message: "Successfully marked all notifications as read",
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
