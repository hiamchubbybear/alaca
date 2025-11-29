using fitlife_planner_back_end.Api.Enums;
using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.DTOs.Resquests
{
    public class CreateProfileRequestDTO
    {
        [Required] public string DisplayName { get; set; }

        public string AvatarUrl { get; set; }

        [Required] public DateTime BirthDate { get; set; }

        [Required] public Gender Gender { get; set; }

        public string Bio { get; set; }

        public CreateProfileRequestDTO()
        {
        }

        public CreateProfileRequestDTO(string displayName )
        {
            DisplayName = displayName;
        }

        // Deprecated
        public CreateProfileRequestDTO(string displayName, string avatarUrl, DateTime birthDate, Gender gender,
            string bio)
        {
            DisplayName = displayName;
            AvatarUrl = avatarUrl;
            BirthDate = birthDate;
            Gender = gender;
            Bio = bio;
        }
    }
}