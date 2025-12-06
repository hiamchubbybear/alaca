using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Services;

public class NotificationService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<NotificationService> _logger;
    private readonly IUserContext _userContext;

    public NotificationService(AppDbContext dbContext, ILogger<NotificationService> logger, IUserContext userContext)
    {
        _dbContext = dbContext;
        _logger = logger;
        _userContext = userContext;
    }

    public async Task<GetNotificationResponseDTO> CreateNotification(CreateNotificationRequestDTO dto)
    {
        var notification = new Notification
        {
            UserId = dto.UserId,
            Title = dto.Title,
            Body = dto.Body,
            Data = dto.Data,
            Type = dto.Type,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Notifications.Add(notification);
        await _dbContext.SaveChangesAsync();

        return new GetNotificationResponseDTO
        {
            Id = notification.Id,
            Title = notification.Title,
            Body = notification.Body,
            Type = notification.Type,
            Data = notification.Data,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt,
            ReadAt = notification.ReadAt
        };
    }

    public async Task<List<GetNotificationResponseDTO>> GetMyNotifications()
    {
        var userId = _userContext.User.userId;
        var notifications = await _dbContext.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return notifications.Select(n => new GetNotificationResponseDTO
        {
            Id = n.Id,
            Title = n.Title,
            Body = n.Body,
            Type = n.Type,
            Data = n.Data,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt,
            ReadAt = n.ReadAt
        }).ToList();
    }

    public async Task<bool> MarkAsRead(Guid id)
    {
        var userId = _userContext.User.userId;
        var notification = await _dbContext.Notifications.FindAsync(id)
            ?? throw new Exception("Notification not found");

        if (notification.UserId != userId)
            throw new UnauthorizedAccessException("This is not your notification");

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllAsRead()
    {
        var userId = _userContext.User.userId;
        var notifications = await _dbContext.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteNotification(Guid id)
    {
        var userId = _userContext.User.userId;
        var notification = await _dbContext.Notifications.FindAsync(id)
            ?? throw new Exception("Notification not found");

        if (notification.UserId != userId)
            throw new UnauthorizedAccessException("This is not your notification");

        _dbContext.Notifications.Remove(notification);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetUnreadCount()
    {
        var userId = _userContext.User.userId;
        var count = await _dbContext.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .CountAsync();
        return count;
    }
}
