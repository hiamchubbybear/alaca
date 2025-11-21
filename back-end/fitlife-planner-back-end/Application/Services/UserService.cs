using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.Mapper;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Responses;
using fitlife_planner_back_end.Api.Util;
using fitlife_planner_back_end.Application.DTOs;
using Microsoft.AspNetCore.Mvc.Formatters;

namespace fitlife_planner_back_end.Application.Services;

public class UserService
{
    private readonly AppDbContext _db;
    private readonly Mapping _mapping;
    private readonly ILogger<UserService> _logger;

    public UserService(AppDbContext db, Mapping mapping, ILogger<UserService> logger)
    {
        _db = db;
        _mapping = mapping;
        _logger = logger;
    }

    public CreateAccountResponseDto CreateUser(CreateAccountRequestDto user)
    {
        string _rawPassword = user.password;
        string _email = user.email;
        string _username = user.username;
        if (_rawPassword.Length < 6 || String.IsNullOrEmpty(_rawPassword) ||
            String.IsNullOrWhiteSpace(_rawPassword))
            throw new InputFormatterException("Password must be more than 6 chars");
        if (_email.Length < 6 || String.IsNullOrEmpty(_email))
            throw new InputFormatterException("Invalid email address");
        if (_db.Users.Any(x => x.Email == _email))
            throw new Exception("Email already exists");
        if (_db.Users.Any(u => u.Username == _username))
            throw new Exception("Username already exists");
        User saveUser = new User(username: _username, email: _email, rawPassword: _rawPassword);
        saveUser.Role = Role.User;
        var profile = new Profile
        {
            UserId = saveUser.Id,
            DisplayName = _username,
            CreateAt = DateTime.UtcNow,
            UpdateAt = DateTime.UtcNow,
            Version = 1
        };
        var savedUser = _db.Users.Add(saveUser);
        _db.Profiles.Add(profile);
        _db.SaveChanges();
        return _mapping.CreateAccountMapper(saveUser);
    }

    public User GetUser(Guid userId)
    {
        if (userId == Guid.Empty)
        {
            throw new InputFormatterException("Invalid user id");
        }

        return _db.Users.FirstOrDefault(x => x.Id == userId);
    }
}