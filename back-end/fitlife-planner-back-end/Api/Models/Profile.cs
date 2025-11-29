using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices.JavaScript;
using fitlife_planner_back_end.Api.Enums;

namespace fitlife_planner_back_end.Api.Models;

public class Profile
{
    [Key] public Guid ProfileId { get; set; }
    public Guid UserId { get; set; }
    public string DisplayName { get; set; }
    public string AvatarUrl { get; set; }
    public DateTime BirthDate { get; set; }
    public Gender Gender { get; set; }
    public string Bio { get; set; }
    public DateTime CreateAt { get; set; }
    public DateTime UpdateAt { get; set; }
    public int Version { get; set; }
    public ICollection<Post> Posts { get; set; }

    public Profile()
    {
    }

    public Profile(Guid userId, string displayName, string avatarUrl, DateTime birthDate, Gender gender, string bio)
    {
        ProfileId = Guid.NewGuid();
        UserId = userId;
        DisplayName = displayName;
        AvatarUrl = avatarUrl;
        BirthDate = birthDate;
        Gender = gender;
        Bio = bio;
        Posts = new List<Post>();
        CreateAt = DateTime.Now;
        UpdateAt = DateTime.Now;
        Version = 1;
    }
}