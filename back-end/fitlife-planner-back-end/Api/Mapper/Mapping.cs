using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Models;

namespace fitlife_planner_back_end.Api.Mapper;

public class Mapping
{
    public CreateAccountResponseDto CreateAccountMapper(User user)
    {
        return new CreateAccountResponseDto(
            user.Id,
            user.Username,
            user.Email,
            user.IsVerified,
            user.CreatedAt,
            user.PhoneNumber,
            user.Version,
            user.Role
        );
    }
    public GetProfileResponseDto GetProfileMapper(Profile profile)
    {
        return new GetProfileResponseDto(
            profile.Id,
            profile.UserId,
            profile.DisplayName,
            profile.AvatarUrl,
            profile.BirthDate,
            profile.Gender,
            profile.Bio
           
        );
    }
     
    
    public Profile InsertProfileMapper(CreateProfileRequestDTO dto, Guid userId)
    {
        return new Profile(
            userId,
            dto.DisplayName,
            dto.AvatarUrl,
            dto.BirthDate,
            dto.Gender,
            dto.Bio,
            DateTime.Now,
            DateTime.Now

        );
    }
    public CreateProfileResponseDto InsertProfileResponseMapper(Profile? profile)
    { 
        return new CreateProfileResponseDto(
            profile.Id,
            profile.UserId,
            profile.DisplayName,
            profile.AvatarUrl,
            profile.BirthDate,
            profile.Gender,
            profile.Bio
        );
    }
}