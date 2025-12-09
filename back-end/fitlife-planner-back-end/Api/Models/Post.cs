using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using fitlife_planner_back_end.Api.Enums;

namespace fitlife_planner_back_end.Api.Models;

public class Post
{
    [Key] public Guid PostId { get; set; }
    public Guid ProfileId { get; set; }

    public string Title { get; set; }
    public string Content { get; set; }
    public string Media { get; set; }
    public int LikeCount { get; set; } // Deprecated - use UpvoteCount/DownvoteCount
    public int UpvoteCount { get; set; }
    public int DownvoteCount { get; set; }
    public int CommentCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Status Status { get; set; }

    // Computed property - not mapped to DB
    [NotMapped]
    public bool IsHidden => Status == Status.Reject;

    public Profile Profile { get; set; }

    public Post()
    {
    }

    public Post(Guid profileId, string title, string content, string media, Status accept)
    {
        PostId = Guid.NewGuid();
        ProfileId = profileId;
        Title = title;
        Content = content;
        Media = media;
        LikeCount = 0;
        UpvoteCount = 0;
        DownvoteCount = 0;
        CommentCount = 0;
        CreatedAt = DateTime.Now;
        UpdatedAt = DateTime.Now;
        Status = accept;
    }
}
