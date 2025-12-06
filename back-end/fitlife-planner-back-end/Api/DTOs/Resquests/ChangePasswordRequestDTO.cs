namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class ChangePasswordRequestDTO
{
    public string CurrentPassword { get; set; }
    public string NewPassword { get; set; }
}
