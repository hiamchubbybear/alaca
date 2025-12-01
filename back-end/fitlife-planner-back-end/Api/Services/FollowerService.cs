using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Services;

public class FollowerService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<FollowerService> _logger;
    private readonly IUserContext _userContext;

    public FollowerService(AppDbContext dbContext, ILogger<FollowerService> logger, IUserContext userContext)
    {
        _dbContext = dbContext;
        _logger = logger;
        _userContext = userContext;
    }

    public virtual async Task<bool> FollowUser(Guid targetUserId)
    {
        var currentUserId = _userContext.User.userId;

        if (currentUserId == targetUserId)
            throw new InvalidOperationException("Cannot follow yourself");

        // Check if target user exists
        var targetUser = await _dbContext.Users.FindAsync(targetUserId);
        if (targetUser == null)
            throw new Exception("User not found");

        // Check if already following
        var existingFollow = await _dbContext.UserFollowers
            .FirstOrDefaultAsync(f => f.UserId == targetUserId && f.FollowerId == currentUserId);

        if (existingFollow != null)
            return false; // Already following

        var follower = new UserFollower
        {
            Id = Guid.NewGuid(),
            UserId = targetUserId,
            FollowerId = currentUserId,
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.UserFollowers.AddAsync(follower);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("User {CurrentUserId} followed user {TargetUserId}", currentUserId, targetUserId);
        return true;
    }

    public virtual async Task<bool> UnfollowUser(Guid targetUserId)
    {
        var currentUserId = _userContext.User.userId;

        var follower = await _dbContext.UserFollowers
            .FirstOrDefaultAsync(f => f.UserId == targetUserId && f.FollowerId == currentUserId);

        if (follower == null)
            return false; // Not following

        _dbContext.UserFollowers.Remove(follower);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("User {CurrentUserId} unfollowed user {TargetUserId}", currentUserId, targetUserId);
        return true;
    }

    public virtual async Task<List<FollowerResponseDTO>> GetFollowers(Guid? userId = null, int page = 1, int pageSize = 20)
    {
        var targetUserId = userId ?? _userContext.User.userId;

        var followers = await _dbContext.UserFollowers
            .Where(f => f.UserId == targetUserId)
            .Include(f => f.Follower)
            .ThenInclude(u => u.Profile)
            .OrderByDescending(f => f.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(f => new FollowerResponseDTO
            {
                Id = f.Id,
                UserId = f.UserId,
                FollowerId = f.FollowerId,
                Username = f.Follower.Username,
                DisplayName = f.Follower.Profile != null ? f.Follower.Profile.DisplayName : f.Follower.Username,
                AvatarUrl = f.Follower.Profile != null ? f.Follower.Profile.AvatarUrl : null,
                FollowedAt = f.CreatedAt
            })
            .ToListAsync();

        return followers;
    }

    public virtual async Task<List<FollowerResponseDTO>> GetFollowing(Guid? userId = null, int page = 1, int pageSize = 20)
    {
        var targetUserId = userId ?? _userContext.User.userId;

        var following = await _dbContext.UserFollowers
            .Where(f => f.FollowerId == targetUserId)
            .Include(f => f.User)
            .ThenInclude(u => u.Profile)
            .OrderByDescending(f => f.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(f => new FollowerResponseDTO
            {
                Id = f.Id,
                UserId = f.UserId,
                FollowerId = f.FollowerId,
                Username = f.User.Username,
                DisplayName = f.User.Profile != null ? f.User.Profile.DisplayName : f.User.Username,
                AvatarUrl = f.User.Profile != null ? f.User.Profile.AvatarUrl : null,
                FollowedAt = f.CreatedAt
            })
            .ToListAsync();

        return following;
    }

    public virtual async Task<FollowerStatsDTO> GetFollowerStats(Guid? userId = null)
    {
        var targetUserId = userId ?? _userContext.User.userId;
        var currentUserId = _userContext.User.userId;

        var followersCount = await _dbContext.UserFollowers
            .CountAsync(f => f.UserId == targetUserId);

        var followingCount = await _dbContext.UserFollowers
            .CountAsync(f => f.FollowerId == targetUserId);

        var isFollowing = await _dbContext.UserFollowers
            .AnyAsync(f => f.UserId == targetUserId && f.FollowerId == currentUserId);

        var isFollowedBy = await _dbContext.UserFollowers
            .AnyAsync(f => f.UserId == currentUserId && f.FollowerId == targetUserId);

        return new FollowerStatsDTO
        {
            FollowersCount = followersCount,
            FollowingCount = followingCount,
            IsFollowing = isFollowing,
            IsFollowedBy = isFollowedBy
        };
    }

    public virtual async Task<List<FollowerResponseDTO>> GetMutualFollowers(Guid targetUserId)
    {
        var currentUserId = _userContext.User.userId;

        // Get users that both current user and target user follow
        var mutualFollowers = await _dbContext.UserFollowers
            .Where(f => f.FollowerId == currentUserId)
            .Join(
                _dbContext.UserFollowers.Where(f => f.FollowerId == targetUserId),
                current => current.UserId,
                target => target.UserId,
                (current, target) => current
            )
            .Include(f => f.User)
            .ThenInclude(u => u.Profile)
            .Select(f => new FollowerResponseDTO
            {
                Id = f.Id,
                UserId = f.UserId,
                FollowerId = f.FollowerId,
                Username = f.User.Username,
                DisplayName = f.User.Profile != null ? f.User.Profile.DisplayName : f.User.Username,
                AvatarUrl = f.User.Profile != null ? f.User.Profile.AvatarUrl : null,
                FollowedAt = f.CreatedAt
            })
            .ToListAsync();

        return mutualFollowers;
    }

    public virtual async Task<List<FollowSuggestionDTO>> GetFollowSuggestions(int limit = 10)
    {
        var currentUserId = _userContext.User.userId;

        // Get users that current user is already following
        var followingIds = await _dbContext.UserFollowers
            .Where(f => f.FollowerId == currentUserId)
            .Select(f => f.UserId)
            .ToListAsync();

        // Find users followed by people you follow (friends of friends)
        var suggestions = await _dbContext.UserFollowers
            .Where(f => followingIds.Contains(f.FollowerId) && f.UserId != currentUserId && !followingIds.Contains(f.UserId))
            .GroupBy(f => f.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                MutualCount = g.Count()
            })
            .OrderByDescending(x => x.MutualCount)
            .Take(limit)
            .ToListAsync();

        var suggestionDTOs = new List<FollowSuggestionDTO>();

        foreach (var suggestion in suggestions)
        {
            var user = await _dbContext.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == suggestion.UserId);

            if (user != null)
            {
                suggestionDTOs.Add(new FollowSuggestionDTO
                {
                    UserId = user.Id,
                    Username = user.Username,
                    DisplayName = user.Profile?.DisplayName ?? user.Username,
                    AvatarUrl = user.Profile?.AvatarUrl,
                    MutualFollowersCount = suggestion.MutualCount,
                    SuggestionReason = $"Followed by {suggestion.MutualCount} people you follow"
                });
            }
        }

        // If not enough suggestions, add popular users
        if (suggestionDTOs.Count < limit)
        {
            var popularUsers = await _dbContext.UserFollowers
                .Where(f => f.UserId != currentUserId && !followingIds.Contains(f.UserId))
                .GroupBy(f => f.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    FollowerCount = g.Count()
                })
                .OrderByDescending(x => x.FollowerCount)
                .Take(limit - suggestionDTOs.Count)
                .ToListAsync();

            foreach (var popular in popularUsers)
            {
                var user = await _dbContext.Users
                    .Include(u => u.Profile)
                    .FirstOrDefaultAsync(u => u.Id == popular.UserId);

                if (user != null && !suggestionDTOs.Any(s => s.UserId == user.Id))
                {
                    suggestionDTOs.Add(new FollowSuggestionDTO
                    {
                        UserId = user.Id,
                        Username = user.Username,
                        DisplayName = user.Profile?.DisplayName ?? user.Username,
                        AvatarUrl = user.Profile?.AvatarUrl,
                        MutualFollowersCount = 0,
                        SuggestionReason = $"Popular in community ({popular.FollowerCount} followers)"
                    });
                }
            }
        }

        return suggestionDTOs;
    }
}
