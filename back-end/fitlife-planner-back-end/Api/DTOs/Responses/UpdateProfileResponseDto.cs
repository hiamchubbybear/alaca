using fitlife_planner_back_end.Api.Enums;

namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class UpdateProfileResponseDto
{
    public string DisplayName { get; set; }
    public string AvatarUrl { get; set; }
    public DateTime BirthDate { get; set; }
    public Gender Gender { get; set; }
  
    public string Bio { get; set; }

    public UpdateProfileResponseDto(string DisplayName, string AvatarUrl, DateTime BirthDate, Gender Gender,
         string Bio)
    {
        this.DisplayName = DisplayName;
        this.AvatarUrl = AvatarUrl;
        this.BirthDate = BirthDate;
        this.Gender = Gender;
        this.Bio = Bio;
    }
}