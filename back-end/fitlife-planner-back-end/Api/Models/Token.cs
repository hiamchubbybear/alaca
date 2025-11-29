using System;
using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models
{
    public class Token
    {
        [Key] public Guid TokenId { get; set; } = Guid.NewGuid();

        [Required] public string RefreshToken { get; set; }

        [Required] public Guid UserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime ExpiryDate { get; set; }

        public bool Revoked { get; set; } = false;

        public User User { get; set; }

        public Token(string refreshToken, Guid userId, DateTime expiryDate)
        {
            RefreshToken = refreshToken;
            UserId = userId;
            ExpiryDate = expiryDate;
        }

        public Token()
        {
        }
    }
}