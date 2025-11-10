namespace fitlife_planner_back_end.Application.DTOs;

public record class LoginRequestDto
{
    public string Email { get; set; }
    public string Password { get; set; }
}
