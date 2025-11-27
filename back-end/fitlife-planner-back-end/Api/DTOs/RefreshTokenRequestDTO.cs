using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace fitlife_planner_back_end.Application.DTOs;

public class RefreshTokenRequestDto
{
    public RefreshTokenRequestDto()
    {
    }

    public RefreshTokenRequestDto(string refreshToken, string userId, string userName)
    {
        RefreshToken = refreshToken;
        UserId = userId;
        UserName = userName;
    }

    [JsonPropertyName("refreshToken")] public string RefreshToken { get; init; }
    [JsonPropertyName("userId")] public string UserId { get; init; }
    [JsonPropertyName("userName")] public string UserName { get; init; }
}