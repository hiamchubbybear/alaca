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

public class PostService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<ProfileService> _logger;
    private readonly Mapping _mapping;
    private readonly PostRepository _postRepository;
    private readonly UserContext _userContext;

    public PostService(AppDbContext dbContext, ILogger<ProfileService> logger, Mapping mapping,
        PostRepository postRepository, UserContext userContext)
    {
        _dbContext = dbContext;
        _logger = logger;
        _mapping = mapping;
        _postRepository = postRepository;
        _userContext = userContext;
    }

    public async Task<PaginatedList<Post>> GetAllPostsAsync(PaginationParameters paginationParameters)
    {
        return _postRepository.GetAll(paginationParameters);
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
        try
        {
            var currentProfileId = _userContext.User.profileId;
            var currentUserRole = _userContext.User.role;
            var post = await _dbContext.Posts
                .FirstOrDefaultAsync<Post>(p => p.PostId == postId);

            if (post == null)
                throw new Exception("Post not found");

            bool isOwner = post.ProfileId == currentProfileId;
            bool isAdmin = currentUserRole == Role.Admin;
            if (!isOwner || isAdmin)
                throw new UnauthorizedAccessException("You do not have permission to update this post.");

            post.Media = dto.Media;
            post.Content = dto.Content;
            post.Title = dto.Title;

            await _dbContext.SaveChangesAsync();
            return _mapping.UpdatePostMapper(post);
        }catch(Exception e){
            _logger.LogError(e, e.Message);
            throw new Exception("Updated Post Failed");
        }
    }

    public async Task<bool> DeletePost(Guid postId)
    {
        try
        {
            var post = await _dbContext.Posts.FindAsync(postId)
                       ?? throw new Exception("Post not found");

            var user = _userContext.User;
            if (post.ProfileId != user.profileId)
            {
                throw new Exception("Forbidden");
            }

            _dbContext.Posts.Remove(post);
            await _dbContext.SaveChangesAsync();

            return true;
        }catch(Exception e){
            _logger.LogError(e, e.Message);
            throw new Exception("Deleted Post Failed");
        }
    }

    public async Task<CreatePostResponseDto> CreatePost(CreatePostRequestDto dto, Guid profileId)
    {
        try
        {
            var post = _mapping.InsertPostMapper(dto, profileId);
            var createdPost = await _dbContext.Posts.AddAsync(post) ??
                              throw new Exception("Failed to create post");
            ;
            await _dbContext.SaveChangesAsync();


            var response = _mapping.InsertPostResponseMapper(createdPost.Entity);
            return response;
        }catch(Exception e){
            _logger.LogError(e, e.Message);
            throw new Exception("Created Post Failed");}
        }
}