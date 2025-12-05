using fitlife_planner_back_end.Api.Enums;

namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class GetPostResponseDto
{
    public Guid PostId { get; set; }
    public Guid ProfileId { get; set; }
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public string Media { get; set; }
    public int LikeCount { get; set; } // Deprecated
    public int UpvoteCount { get; set; }
    public int DownvoteCount { get; set; }
    public int CommentCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public GetPostResponseDto(Guid postId, Guid profileId, Guid userId, string username, string? avatarUrl,
        string title, string content, string media, int likeCount, int upvoteCount, int downvoteCount,
        int commentCount, DateTime createdAt, DateTime updatedAt)
    {
        PostId = postId;
        ProfileId = profileId;
        UserId = userId;
        Username = username;
        AvatarUrl = avatarUrl;
        Title = title;
        Content = content;
        Media = media;
        LikeCount = likeCount;
        UpvoteCount = upvoteCount;
        DownvoteCount = downvoteCount;
        CommentCount = commentCount;
        CreatedAt = createdAt;
        UpdatedAt = updatedAt;
    }


    public GetPostResponseDto()
    {
    }
}
