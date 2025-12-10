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
        if (dto.Type == "system")
        {
            // Fan-out optimization: Process in batches to avoid memory/timeout issues
            int batchSize = 500;
            int totalProcessed = 0;
            bool firstBatchProcessed = false;
            GetNotificationResponseDTO? representativeResponse = null;

            // We iterate based on existing users using sorting and paging
            // Note: Efficient for steady data. If users are added rapidly during this, consistent sorting (Id) helps.
            int page = 0;
            while (true)
            {
                var userIds = await _dbContext.Users
                    .OrderBy(u => u.Id)
                    .Select(u => u.Id)
                    .Skip(page * batchSize)
                    .Take(batchSize)
                    .ToListAsync();

                if (!userIds.Any()) break;

                var notifications = userIds.Select(userId => new Notification
                {
                    UserId = userId,
                    Title = dto.Title,
                    Body = dto.Body,
                    Data = dto.Data,
                    Type = dto.Type,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                await _dbContext.Notifications.AddRangeAsync(notifications);
                await _dbContext.SaveChangesAsync();

                // Capture the first notification of the first batch for the response
                if (!firstBatchProcessed && notifications.Count > 0)
                {
                    var first = notifications[0];
                    representativeResponse = new GetNotificationResponseDTO
                    {
                        Id = first.Id,
                        Title = first.Title,
                        Body = first.Body,
                        Type = first.Type,
                        Data = first.Data,
                        IsRead = first.IsRead,
                        CreatedAt = first.CreatedAt,
                        ReadAt = first.ReadAt
                    };
                    firstBatchProcessed = true;
                }

                page++;
                // Detach entries to keep context lean
                foreach (var entry in _dbContext.ChangeTracker.Entries())
                {
                    entry.State = EntityState.Detached;
                }
            }

            return representativeResponse ?? new GetNotificationResponseDTO
            {
                 // Fallback if no users exist
                 Title = dto.Title,
                 Body = dto.Body,
                 Type = dto.Type,
                 CreatedAt = DateTime.UtcNow
            };
        }

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

    public async Task<(List<GetNotificationResponseDTO> notifications, int total)> GetNotificationHistory(int page, int pageSize)
    {
        var total = await _dbContext.Notifications.CountAsync();

        var notifications = await (from n in _dbContext.Notifications
                                   join u in _dbContext.Users on n.UserId equals u.Id into users
                                   from u in users.DefaultIfEmpty()
                                   orderby n.CreatedAt descending
                                   select new GetNotificationResponseDTO
                                   {
                                       Id = n.Id,
                                       Title = n.Title,
                                       Body = n.Body,
                                       Type = n.Type,
                                       Data = n.Data,
                                       IsRead = n.IsRead,
                                       CreatedAt = n.CreatedAt,
                                       ReadAt = n.ReadAt,
                                       UserId = n.UserId,
                                       Username = u != null ? u.Username : "Unknown"
                                   })
                                   .Skip((page - 1) * pageSize)
                                   .Take(pageSize)
                                   .ToListAsync();

        return (notifications, total);
    }
}
