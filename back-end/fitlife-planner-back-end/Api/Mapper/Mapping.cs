using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Responses;

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
}