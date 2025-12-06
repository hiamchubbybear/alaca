using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class PasswordResetToken
{
    [Key]
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    [Required]
    [MaxLength(256)]
    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public bool IsUsed { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation property
    public User User { get; set; } = null!;

    public PasswordResetToken()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
        IsUsed = false;
    }

    public PasswordResetToken(Guid userId, string token, int expirationMinutes = 15) : this()
    {
        UserId = userId;
        Token = token;
        ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);
    }

    public bool IsValid()
    {
        return !IsUsed && DateTime.UtcNow < ExpiresAt;
    }
}
