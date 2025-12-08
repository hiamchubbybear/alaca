namespace fitlife_planner_back_end.Api.DTOs.Requests;

public class GoogleUserInfo
{
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string GoogleId { get; set; } = string.Empty;
    public string? Picture { get; set; }
    public bool EmailVerified { get; set; }
}
