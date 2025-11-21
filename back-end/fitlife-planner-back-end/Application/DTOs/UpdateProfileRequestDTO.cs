using fitlife_planner_back_end.Api.Models;

namespace fitlife_planner_back_end.Application.DTOs;

public class UpdateProfileRequestDto
{
    public string DisplayName { get; set; }
    public string AvatarUrl { get; set; }
    public DateTime? BirthDate { get; set; }
    public Gender? Gender { get; set; }
    public float? HeightCm { get; set; }
    public float? WeightKg { get; set; }
    public string Bio { get; set; }
    public Dictionary<string, object> Goals { get; set; }

    public UpdateProfileRequestDto(string displayName, string avatarUrl, DateTime? birthDate, Gender? gender,
        float? heightCm, float? weightKg, string bio, Dictionary<string, object> goals)
    {
        DisplayName = displayName;
        AvatarUrl = avatarUrl;
        BirthDate = birthDate;
        Gender = gender;
        HeightCm = heightCm;
        WeightKg = weightKg;
        Bio = bio;
        Goals = goals;
    }

    public UpdateProfileRequestDto()
    {
    }
}