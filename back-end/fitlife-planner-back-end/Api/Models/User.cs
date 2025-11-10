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
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public string Username { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
}