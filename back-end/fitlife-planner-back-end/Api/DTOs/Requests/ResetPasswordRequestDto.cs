namespace fitlife_planner_back_end.Api.DTOs.Requests;

public record ResetPasswordRequestDto(
    string Token,
    string NewPassword
);
