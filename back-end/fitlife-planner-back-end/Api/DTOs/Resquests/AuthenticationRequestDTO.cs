using fitlife_planner_back_end.Api.Enums;

namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public record AuthenticationRequestDto(string username, string email, Guid id, Role role)
{
private Guid _id;
private string _username;
private string _email;
private string _role;
}