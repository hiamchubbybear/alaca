using fitlife_planner_back_end.Api.Enums;

namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class GetPostResponseDto
{
    public Guid PostId { get; set; }
    public Guid ProfileId { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public string Media { get; set; }
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public GetPostResponseDto(Guid postId, Guid profileId, string title, string content, string media,
        int likeCount, int commentCount, DateTime createdAt, DateTime updatedAt)
    {
        PostId = postId;
        ProfileId = profileId;
        Title = title;
        Content = content;
        Media = media;
        LikeCount = likeCount;
        CommentCount = commentCount;
        CreatedAt = createdAt;
        UpdatedAt = updatedAt;
    }


    public GetPostResponseDto()
    {
    }
}
