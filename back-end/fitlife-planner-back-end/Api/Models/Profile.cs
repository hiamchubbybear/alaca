using System.ComponentModel.DataAnnotations;
using fitlife_planner_back_end.Api.Enums;

namespace fitlife_planner_back_end.Api.Models;

public class Profile
{
    [Key] public Guid Id = Guid.NewGuid();
    public Guid UserId;
    public string DisplayName;
    public string AvatarUrl;
    public DateTime BirthDate;
    public Gender Gender;
    public string Bio;
    public DateTime CreateAt;
    public DateTime UpdateAt;
    public int Version;

}

