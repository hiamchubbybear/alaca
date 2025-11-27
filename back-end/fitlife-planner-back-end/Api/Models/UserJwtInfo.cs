namespace fitlife_planner_back_end.Api.DTOs;

public class UserJwtInfo
{
    public Guid userId { get; set; }
    public String userame { get; set; }
    public String email { get; set; }

    public UserJwtInfo(Guid userId, string userame, string email)
    {
        this.userId = userId;
        this.email = email;
        this.userame = userame;
    }
}