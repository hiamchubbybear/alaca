using fitlife_planner_back_end.Api.Enums;

namespace fitlife_planner_back_end.Api.DTOs.Responses
{
    public class GetProfileResponseDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string DisplayName { get; set; }
        public string AvatarUrl { get; set; }
        public DateTime BirthDate { get; set; }
        public Gender Gender { get; set; }
        public string Bio { get; set; }
        public DateTime CreateAt { get; set; }
        public DateTime UpdateAt { get; set; }
        public int Version { get; set; }

        public GetProfileResponseDto(Guid id, Guid userId, string displayName, string avatarUrl, DateTime birthDate,
            Gender gender, string bio)
        {
            Id = id;
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

        public GetProfileResponseDto()
        {
        }
    }
}
