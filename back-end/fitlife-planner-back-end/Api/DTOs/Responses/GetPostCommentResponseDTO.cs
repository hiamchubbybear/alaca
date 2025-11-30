namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class GetPostCommentResponseDTO
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public Guid UserId { get; set; }
    public string UserDisplayName { get; set; }
    public string? UserAvatarUrl { get; set; }
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; }
}
