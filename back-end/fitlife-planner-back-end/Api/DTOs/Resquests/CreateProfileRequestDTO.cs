using fitlife_planner_back_end.Api.Enums;
using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.DTOs.Resquests
{
    public class CreateProfileRequestDTO
    {
        public Guid Id;
        public Guid UserId;
        public string DisplayName;
        public string AvatarUrl;
        public DateTime BirthDate;
        public Gender Gender;
        public string Bio;
        public DateTime CreateAt;
        public DateTime UpdateAt;
        public int Version;

        public CreateProfileRequestDTO()
        {
        }

        public CreateProfileRequestDTO(Guid userId, string displayName, string avatarUrl, DateTime birthDate, Gender gender, string bio)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            DisplayName = displayName;
            AvatarUrl = avatarUrl;
            BirthDate = birthDate;
            Gender = gender;
            Bio = bio;
            CreateAt = DateTime.Now;
            UpdateAt = DateTime.Now;
            Version = 1;
        }
    }
}