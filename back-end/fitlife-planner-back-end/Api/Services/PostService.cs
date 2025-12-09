using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Enums;
using fitlife_planner_back_end.Api.Mapper;
using fitlife_planner_back_end.Api.Repository;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Util;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Services;

public class PostService(
    AppDbContext dbContext,
    ILogger<ProfileService> logger,
    Mapping mapping,
    PostRepository postRepository,
    UserContext userContext)
{
    public async Task<PaginatedList<GetPostResponseDto>> GetAllPostsAsync(PaginationParameters paginationParameters)
    {
        // Get posts with profiles included
        var query = dbContext.Posts
            .Include(p => p.Profile)
            .OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync();

        var posts = await query
            .Skip((paginationParameters.PageNumber - 1) * paginationParameters.PageSize)
            .Take(paginationParameters.PageSize)
            .ToListAsync();

        var postDtos = new List<GetPostResponseDto>();

        foreach (var post in posts)
        {
            if (post.Profile != null)
            {
                var user = await dbContext.Users.FindAsync(post.Profile.UserId);
                if (user != null)
                {
                    var currentUserId = userContext.User.userId;
                    postDtos.Add(mapping.GetPostMapper(post, post.Profile, user, currentUserId));
                }
            }
        }

        return new PaginatedList<GetPostResponseDto>(
            postDtos,
            totalCount,
            paginationParameters.PageNumber,
            paginationParameters.PageSize
        );
    }

    public async Task<PaginatedList<GetPostResponseDto>> GetAllPostsAsyncByUser(PaginationParameters paginationParameters)
    {
        // Get posts with profiles included
        var query = dbContext.Posts
            .Where(p => p.Status == Status.Accept)
            .Include(p => p.Profile)
            .OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync();

        var posts = await query
            .Skip((paginationParameters.PageNumber - 1) * paginationParameters.PageSize)
            .Take(paginationParameters.PageSize)
            .ToListAsync();

        var postDtos = new List<GetPostResponseDto>();

        foreach (var post in posts)
        {
            if (post.Profile != null)
            {
                var user = await dbContext.Users.FindAsync(post.Profile.UserId);
                if (user != null)
                {
                    var currentUserId = userContext.User.userId;
                    postDtos.Add(mapping.GetPostMapper(post, post.Profile, user, currentUserId));
                }
            }
        }

        return new PaginatedList<GetPostResponseDto>(
            postDtos,
            totalCount,
            paginationParameters.PageNumber,
            paginationParameters.PageSize
        );
    }

    public async Task<PaginatedList<GetPostResponseDto>> GetAllPostsByLikeAsync(
        PaginationParameters paginationParameters)
    {
        // Get only accepted posts with profiles included, ordered by like count
        var query = dbContext.Posts
            .Where(p => p.Status == Status.Accept) // Only show accepted posts
            .Include(p => p.Profile)
            .OrderByDescending(p => p.LikeCount);

        var totalCount = await query.CountAsync();

        var posts = await query
            .Skip((paginationParameters.PageNumber - 1) * paginationParameters.PageSize)
            .Take(paginationParameters.PageSize)
            .ToListAsync();

        var postDtos = new List<GetPostResponseDto>();

        foreach (var post in posts)
        {
            if (post.Profile != null)
            {
                var user = await dbContext.Users.FindAsync(post.Profile.UserId);
                if (user != null)
                {
                    var currentUserId = userContext.User.userId;
                    postDtos.Add(mapping.GetPostMapper(post, post.Profile, user, currentUserId));
                }
            }
        }

        return new PaginatedList<GetPostResponseDto>(
            postDtos,
            totalCount,
            paginationParameters.PageNumber,
            paginationParameters.PageSize
        );
    }

    public async Task<GetPostResponseDto> GetPostById(Guid postId)
    {
        if (string.IsNullOrWhiteSpace(postId.ToString()))
        {
            throw new ArgumentException("Invalid post id");
        }

        var post = await dbContext.Posts
                       .Include(p => p.Profile)
                       .FirstOrDefaultAsync(p => p.PostId == postId)
                   ?? throw new KeyNotFoundException("Post not found");

        var user = await dbContext.Users.FindAsync(post.Profile.UserId)
                   ?? throw new KeyNotFoundException("User not found");

        var currentUserId = userContext.User.userId;
        var response = mapping.GetPostMapper(post, post.Profile, user, currentUserId);
        return response ?? throw new InvalidOperationException("Failed to map post data");
    }

    public async Task<List<GetPostResponseDto>> GetMyPost()
    {
        var userId = userContext.User.userId;
        var profile = await dbContext.Profiles
            .FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null)
            throw new KeyNotFoundException("Profile not found");

        var user = await dbContext.Users.FindAsync(userId)
                   ?? throw new KeyNotFoundException("User not found");

        var posts = await dbContext.Posts
            .Where(p => p.ProfileId == profile.ProfileId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        if (posts == null || posts.Count == 0)
            return new List<GetPostResponseDto>();

        var currentUserId = userContext.User.userId;
        var result = posts.Select(p => mapping.GetPostMapper(p, profile, user, currentUserId)).ToList();
        return result;
    }

    /*public async Task<List<GetPostResponseDto>> GetAllPosts()
    {
        var user = _dbContext.Users;

        IQueryable<Post> query = _db.Posts;

        if (user.Role != Role.Admin)
        {
            query = query.Where(p => p.UserId == user.userId);
        }

        var posts = await query.ToListAsync();

        return posts.Select(_mapping.PostMapper).ToList();
    }*/
    // public async Task<List<GetProfileResponseDto>> GetMyPost()
    // {
    //     try
    //     {
    //         var profileId = _userContext.User.profileId;
    //
    //         var post =
    //             await _dbContext.Posts.FirstOrDefaultAsync(p =>
    //                 p.ProfileId == profileId) ??
    //             throw new Exception("Post not found");
    //         ;
    //         var response = _mapping.GetPostMapper(post);
    //         return response ?? throw new Exception("Profile not found");
    //     }
    //     catch (Exception e)
    //     {
    //         _logger.LogError(e, e.Message);
    //         throw new Exception("Profile not found");
    //     }
    // }
    public async Task<UpdatePostResponseDto> UpdatePost(Guid postId, UpdatePostRequestDto dto)
    {
        var currentProfileId = userContext.User.profileId;
        var currentUserRole = userContext.User.role;
        var post = await dbContext.Posts
            .FirstOrDefaultAsync<Post>(p => p.PostId == postId);

        if (post == null)
            throw new KeyNotFoundException("Post not found");

        bool isOwner = post.ProfileId == currentProfileId;
        bool isAdmin = currentUserRole == Role.Admin;
        if (!isOwner && !isAdmin)
            throw new UnauthorizedAccessException("You do not have permission to update this post");

        post.Media = dto.Media;
        post.Content = dto.Content;
        post.Title = dto.Title;

        await dbContext.SaveChangesAsync();
        return mapping.UpdatePostMapper(post);
    }

    public async Task<bool> DeletePost(Guid postId)
    {
        var post = await dbContext.Posts.FindAsync(postId)
                   ?? throw new KeyNotFoundException("Post not found");

        var user = userContext.User;
        if (post.ProfileId != user.profileId)
        {
            throw new UnauthorizedAccessException("You do not have permission to delete this post");
        }

        dbContext.Posts.Remove(post);
        await dbContext.SaveChangesAsync();

        return true;
    }

    // Admin methods
    public async Task<bool> DeletePostAdmin(Guid postId)
    {
        var post = await dbContext.Posts.FindAsync(postId)
                   ?? throw new KeyNotFoundException("Post not found");

        dbContext.Posts.Remove(post);
        await dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<bool> HidePost(Guid postId)
    {
        var post = await dbContext.Posts.FindAsync(postId)
                   ?? throw new KeyNotFoundException("Post not found");

        post.Status = Status.Reject;
        await dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ShowPost(Guid postId)
    {
        var post = await dbContext.Posts.FindAsync(postId)
                   ?? throw new KeyNotFoundException("Post not found");

        post.Status = Status.Accept;
        await dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<CreatePostResponseDto> CreatePost(CreatePostRequestDto dto)
    {
        var profileId = userContext.User.profileId;
        var post = mapping.InsertPostMapper(dto, profileId);
        var createdPost = await dbContext.Posts.AddAsync(post);

        if (createdPost == null || createdPost.Entity == null)
            throw new InvalidOperationException("Failed to create post");

        await dbContext.SaveChangesAsync();

        var response = mapping.InsertPostResponseMapper(createdPost.Entity);
        return response;
    }


    public async Task<bool> ApprovePostAsync(Guid postId)
    {
        var post = await dbContext.Posts.FindAsync(postId);

        if (post == null)
            throw new Exception("Post not found");

        if (post.Status != Status.Pending)
            throw new Exception("Post is not in pending state");

        post.Status = Status.Accept;
        dbContext.Posts.Update(post);
        await dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<bool> RejectPostAsync(Guid postId)
    {
        var post = await dbContext.Posts.FindAsync(postId);

        if (post == null)
            throw new Exception("Post not found");

        if (post.Status != Status.Pending)
            throw new Exception("Post is not in pending state");

        post.Status = Status.Reject;

        dbContext.Posts.Update(post);
        await dbContext.SaveChangesAsync();

        return true;
    }

    // Vote methods
    public async Task<bool> VoteOnPost(Guid postId, VoteType voteType)
    {
        var userId = userContext.User.userId;

        // Check if post exists
        var post = await dbContext.Posts.FindAsync(postId)
                   ?? throw new KeyNotFoundException("Post not found");

        // Check if user already voted
        var existingVote = await dbContext.PostVotes
            .FirstOrDefaultAsync(v => v.PostId == postId && v.UserId == userId);

        if (existingVote != null)
        {
            // Update existing vote if different
            if (existingVote.VoteType != voteType)
            {
                // Remove old vote count
                if (existingVote.VoteType == VoteType.Upvote)
                    post.UpvoteCount = Math.Max(0, post.UpvoteCount - 1);
                else
                    post.DownvoteCount = Math.Max(0, post.DownvoteCount - 1);

                // Update vote type
                existingVote.VoteType = voteType;
                existingVote.UpdatedAt = DateTime.UtcNow;

                // Add new vote count
                if (voteType == VoteType.Upvote)
                    post.UpvoteCount++;
                else
                    post.DownvoteCount++;

                dbContext.PostVotes.Update(existingVote);
            }
            // If same vote type, do nothing (already voted)
        }
        else
        {
            // Create new vote
            var newVote = new PostVote
            {
                PostId = postId,
                UserId = userId,
                VoteType = voteType
            };

            await dbContext.PostVotes.AddAsync(newVote);

            // Update vote count
            if (voteType == VoteType.Upvote)
                post.UpvoteCount++;
            else
                post.DownvoteCount++;
        }

        dbContext.Posts.Update(post);
        await dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<bool> RemoveVote(Guid postId)
    {
        var userId = userContext.User.userId;

        var vote = await dbContext.PostVotes
            .FirstOrDefaultAsync(v => v.PostId == postId && v.UserId == userId);

        if (vote == null)
            return false; // No vote to remove

        var post = await dbContext.Posts.FindAsync(postId)
                   ?? throw new KeyNotFoundException("Post not found");

        // Decrease vote count
        if (vote.VoteType == VoteType.Upvote)
            post.UpvoteCount = Math.Max(0, post.UpvoteCount - 1);
        else
            post.DownvoteCount = Math.Max(0, post.DownvoteCount - 1);

        // Remove the vote
        dbContext.PostVotes.Remove(vote);
        dbContext.Posts.Update(post);
        await dbContext.SaveChangesAsync();

        return true;
    }


    // --- POST MODERATION METHODS ---

    public async Task<PaginatedList<GetPostResponseDto>> GetPostsByStatusAsync(
        Status status,
        PaginationParameters paginationParameters)
    {
        var query = dbContext.Posts
            .Include(p => p.Profile)
            .Where(p => p.Status == status)
            .OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync();

        var posts = await query
            .Skip((paginationParameters.PageNumber - 1) * paginationParameters.PageSize)
            .Take(paginationParameters.PageSize)
            .ToListAsync();

        var postDtos = new List<GetPostResponseDto>();
        foreach (var post in posts)
        {
            if (post.Profile != null)
            {
                var user = await dbContext.Users.FindAsync(post.Profile.UserId);
                if (user != null)
                {
                    postDtos.Add(mapping.GetPostMapper(post, post.Profile, user));
                }
            }
        }

        return new PaginatedList<GetPostResponseDto>(
            postDtos,
            totalCount,
            paginationParameters.PageNumber,
            paginationParameters.PageSize
        );
    }

    public async Task<PaginatedList<GetPostResponseDto>> GetPostsByUserAsync(
        Guid userId,
        PaginationParameters paginationParameters)
    {
        // Find user's profile
        var profile = await dbContext.Profiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
            throw new Exception("User profile not found");

        var query = dbContext.Posts
            .Include(p => p.Profile)
            .Where(p => p.ProfileId == profile.ProfileId)
            .OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync();

        var posts = await query
            .Skip((paginationParameters.PageNumber - 1) * paginationParameters.PageSize)
            .Take(paginationParameters.PageSize)
            .ToListAsync();

        var postDtos = new List<GetPostResponseDto>();
        var user = await dbContext.Users.FindAsync(userId);

        foreach (var post in posts)
        {
            if (post.Profile != null && user != null)
            {
                postDtos.Add(mapping.GetPostMapper(post, post.Profile, user));
            }
        }

        return new PaginatedList<GetPostResponseDto>(
            postDtos,
            totalCount,
            paginationParameters.PageNumber,
            paginationParameters.PageSize
        );
    }

    public async Task<bool> ResubmitPostAsync(Guid postId)
    {
        var post = await dbContext.Posts.FindAsync(postId);
        if (post == null)
            throw new Exception("Post not found");

        // Check if user owns the post
        var currentUserId = userContext.User.userId;
        var profile = await dbContext.Profiles
            .FirstOrDefaultAsync(p => p.ProfileId == post.ProfileId);

        if (profile == null)
            throw new Exception("Profile not found");

        if (profile.UserId != currentUserId)
            throw new UnauthorizedAccessException("You can only resubmit your own posts");

        if (post.Status != Status.Reject)
            throw new Exception("Only rejected posts can be resubmitted");

        post.Status = Status.Pending;
        post.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();
        return true;
    }
}