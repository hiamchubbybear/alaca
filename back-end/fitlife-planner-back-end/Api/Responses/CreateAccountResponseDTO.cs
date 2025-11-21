using fitlife_planner_back_end.Api.Models;

namespace fitlife_planner_back_end.Api.Responses;

public record CreateAccountResponseDto(
    Guid Id,
    string Username,
    string Email,
    bool IsVerified,
    DateTime CreatedAt,
    string? PhoneNumber,
    int Version,
    Role Role);