
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Enums;
using fitlife_planner_back_end.Api.Models;

namespace fitlife_planner_back_end.Api.Mapper;

public class Mapping
{
    private readonly AppDbContext _dbContext;

    public Mapping(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public CreateAccountResponseDto CreateAccountMapper(User user)
    {
        return new CreateAccountResponseDto(
            user.Id,
            user.Username,
            user.Email,
            user.IsVerified,
            user.CreatedAt,
            user.PhoneNumber,
            user.Version,
            user.Role
        );
    }

    public GetProfileResponseDto GetProfileMapper(Profile profile)
    {
        return new GetProfileResponseDto(
            profile.ProfileId,
            profile.UserId,
            profile.DisplayName,
            profile.AvatarUrl,
            profile.BirthDate,
            profile.Gender,
            profile.Bio
        );
    }


    public Profile InsertProfileMapper(CreateProfileRequestDTO dto, Guid userId)
    {
        return new Profile(
            userId,
            dto.DisplayName,
            dto.AvatarUrl,
            dto.BirthDate,
            dto.Gender,
            dto.Bio
        );
    }

    public CreateProfileResponseDto InsertProfileResponseMapper(Profile profile)
    {
        return new CreateProfileResponseDto(
            profile.ProfileId,
            profile.UserId,
            profile.DisplayName,
            profile.AvatarUrl,
            profile.BirthDate,
            profile.Gender,
            profile.Bio,
            profile.CreateAt,
            profile.UpdateAt
        );
    }

    public UpdateProfileResponseDto UpdateProfileMapper(Profile profile)
    {
        return new UpdateProfileResponseDto(
            profile.DisplayName,
            profile.AvatarUrl,
            profile.BirthDate,
            profile.Gender,
            profile.Bio
        );
    }

    public UpdatePostResponseDto UpdatePostMapper(Post post)
    {
        return new UpdatePostResponseDto(
            post.Title,
            post.Content,
            post.Media
        );
    }

    public Post InsertPostMapper(CreatePostRequestDto dto , Guid profileId)
    {
        return new Post(
            profileId,
            dto.Title,
            dto.Content,
            dto.Media,
            Status.Accept  // Auto-accept all new posts
        );
    }
    public CreatePostResponseDto InsertPostResponseMapper(Post post)
    {
        return new CreatePostResponseDto(
            post.PostId,
            post.ProfileId,
            post.Title,
            post.Content,
            post.Media,
            post.LikeCount,
            post.CommentCount,
            post.CreatedAt,
            post.UpdatedAt
        );
    }
    public GetPostResponseDto GetPostMapper(Post post, Profile profile, User user, Guid? currentUserId = null)
    {
        string? userVoteType = null;

        // Check if current user has voted on this post
        if (currentUserId.HasValue)
        {
            var userVote = _dbContext.PostVotes
                .FirstOrDefault(v => v.PostId == post.PostId && v.UserId == currentUserId.Value);

            if (userVote != null)
            {
                userVoteType = userVote.VoteType == VoteType.Upvote ? "Upvote" : "Downvote";
            }
        }

        var dto = new GetPostResponseDto(
            post.PostId,
            post.ProfileId,
            user.Id,
            user.Username,
            profile.AvatarUrl,
            post.Title,
            post.Content,
            post.Media,
            post.LikeCount,
            post.UpvoteCount,
            post.DownvoteCount,
            post.CommentCount,
            post.CreatedAt,
            post.UpdatedAt
        );

        dto.UserVoteType = userVoteType;
        dto.IsHidden = post.IsHidden;
        dto.Status = post.Status.ToString();

        return dto;
    }

}
