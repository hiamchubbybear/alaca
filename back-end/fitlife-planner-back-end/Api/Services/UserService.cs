using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Enums;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Mapper;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Services;
using fitlife_planner_back_end.Api.Util;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Application.Services;

public class UserService(
    AppDbContext db,
    Mapping mapping,
    ILogger<UserService> logger,
    IUserContext userContext,
    ProfileService profileService)
{
    public async Task<CreateAccountResponseDto> CreateUser(CreateAccountRequestDto user)
    {
        string rawPassword = user.password;
        string email = user.email;
        string username = user.username;

        if (rawPassword.Length < 6 || String.IsNullOrEmpty(rawPassword) ||
            String.IsNullOrWhiteSpace(rawPassword))
            throw new ArgumentException("Password must be more than 6 characters");

        if (email.Length < 6 || String.IsNullOrEmpty(email))
            throw new ArgumentException("Invalid email address");

        if (db.Users.Any(x => x.Email == email))
            throw new InvalidOperationException("Email already exists");

        if (db.Users.Any(u => u.Username == username))
            throw new InvalidOperationException("Username already exists");

        User saveUser = new User(username: username, email: email, rawPassword: rawPassword);
        saveUser.Role = Role.User;

        var accountSaved = await db.Users.AddAsync(saveUser);
        await profileService.CreateProfile(new CreateProfileRequestDTO(username), accountSaved.Entity.Id);
        await db.SaveChangesAsync();

        return mapping.CreateAccountMapper(saveUser);
    }

    public async Task<User?> GetUser()
    {
        Guid userId = userContext.User.userId;

        if (userId == Guid.Empty)
        {
            throw new InputFormatterException("Invalid user id");
        }

        return await db.Users.FirstOrDefaultAsync(x => x.Id == userId);
    }
}
