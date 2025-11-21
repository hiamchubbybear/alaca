using System.ComponentModel.DataAnnotations;
using fitlife_planner_back_end.Api.Util;

namespace fitlife_planner_back_end.Api.Models;

public class User
{
    public User()
    {
    }

    public User(string username, string email, string rawPassword)
    {
        Username = username;
        Email = email;
        Password = PasswordEncoder.EncodePassword(rawPassword);
    }

    public User(string username, string email, string hashPassword, Role role)
    {
        Username = username;
        Email = email;
        Password = PasswordEncoder.EncodePassword(hashPassword);
        ;
        Role = role;
    }

    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public string Username { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? PhoneNumber { get; set; }
    public int Version { get; set; }
    public Role Role { get; set; }
}

public enum Role
{
    Admin,
    User
}