namespace fitlife_planner_back_end.Application.DTOs;

public record AuthenticationRequestDto(string username, string email, Guid id)
{
    private Guid _id;
    private string _username;
    private string _email;
}