using fitlife_planner_back_end.Api.Enums;

namespace fitlife_planner_back_end.Api.DTOs;

public class UserJwtInfo
{
    public Guid userId { get; set; }
    public String userame { get; set; }
    public String email { get; set; }
    public Role role { get; set; }
    public Guid profileId { get; set; }

    public UserJwtInfo(Guid userId, string userame, string email, Role role, Guid profileId)
    {
        this.role = role;
        this.userId = userId;
        this.email = email;
        this.userame = userame;
        this.profileId = profileId;
    }
}