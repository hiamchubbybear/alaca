namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class GetPostResponseDto
{
    public Guid PostId;
    public Guid ProfileId; 
    public string Title;
    public string Content;
    public string Media;
    public int LikeCount; 
    public int CommentCount;
    public DateTime CreatedAt;
    public DateTime? UpdatedAt;

    public GetPostResponseDto(Guid postId, Guid profileId, string title, string content, string media, int likeCount, int commentCount)
    {
        PostId = postId;
        ProfileId = profileId;
        Title = title;
        Content = content;
        Media = media;
        LikeCount = likeCount;
        CommentCount = commentCount;
        CreatedAt = DateTime.Now;
        UpdatedAt = DateTime.Now;
    }
}