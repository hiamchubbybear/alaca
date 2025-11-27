using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace fitlife_planner_back_end.Application.DTOs;

public record LoginRequestDto
{
    [Required] [JsonPropertyName("email")] public string Email { get; set; }

    [Required]
    [JsonPropertyName("password")]
    public string Password { get; set; }
}