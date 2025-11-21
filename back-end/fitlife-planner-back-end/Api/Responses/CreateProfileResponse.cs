using fitlife_planner_back_end.Api.Models;


namespace fitlife_planner_back_end.Api.Responses
{
    public class CreateProfileResponseDto
    {
        public CreateProfileResponseDto(Guid id, Guid userId, string displayName, string avatarUrl, DateTime birthDate,
            Gender gender, float heightCm, float weightKg, float bmi, string bio, Dictionary<string, object> goals,
            DateTime createAt, DateTime updateAt, int version)
        {
            Id = id;
            UserId = userId;
            DisplayName = displayName;
            AvatarUrl = avatarUrl;
            BirthDate = birthDate;
            Gender = gender;
            HeightCm = heightCm;
            WeightKg = weightKg;
            BMI = bmi;
            Bio = bio;
            Goals = goals;
            CreateAt = createAt;
            UpdateAt = updateAt;
            Version = version;
        }


        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string DisplayName { get; set; }
        public string AvatarUrl { get; set; }
        public DateTime BirthDate { get; set; }
        public Gender Gender { get; set; }
        public float HeightCm { get; set; }
        public float WeightKg { get; set; }
        public float BMI { get; set; }
        public string Bio { get; set; }
        public Dictionary<string, object> Goals { get; set; }
        public DateTime CreateAt { get; set; }
        public DateTime UpdateAt { get; set; }
        public int Version { get; set; }

        public CreateProfileResponseDto()
        {
        }
    }
}