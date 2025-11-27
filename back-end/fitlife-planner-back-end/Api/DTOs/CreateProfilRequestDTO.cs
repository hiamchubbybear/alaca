using fitlife_planner_back_end.Api.Enums;
using fitlife_planner_back_end.Api.Models;

namespace fitlife_planner_back_end.Application.DTOs;

public class CreateProfileRequestDto
{
    public Guid UserId { get; set; }
    public string DisplayName { get; set; }
    public DateTime BirthDate { get; set; }
    public Gender Gender { get; set; }
    public float HeightCm { get; set; }
    public float WeightKg { get; set; }

    public CreateProfileRequestDto(Guid userId, string displayName, DateTime birthDate, Gender gender, float heightCm,
        float weightKg)
    {
        UserId = userId;
        DisplayName = displayName;
        BirthDate = birthDate;
        Gender = gender;
        HeightCm = heightCm;
        WeightKg = weightKg;
    }
}