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

    public async Task<CreateAccountRequestDto> CreateAdminUser(CreateAccountRequestDto user)
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
        saveUser.Role = Role.Admin; // Set as Admin

        var accountSaved = await db.Users.AddAsync(saveUser);
        await profileService.CreateProfile(new CreateProfileRequestDTO(username), accountSaved.Entity.Id);
        await db.SaveChangesAsync();

        return user;
    }

    // ADMIN TOOLS
    public async Task<object> GetAllUsers(int page, int pageSize)
    {
        var skip = (page - 1) * pageSize;
        var users = await db.Users.Include(u => u.Profile).Skip(skip).Take(pageSize).ToListAsync();
        var total = await db.Users.CountAsync();
        return new { users = users.Select(u => new { u.Id, u.Username, u.Email, u.Role, u.CreatedAt, Profile = u.Profile }), total, page, pageSize };
    }

    public async Task<bool> BanUser(Guid id)
    {
        var user = await db.Users.FindAsync(id) ?? throw new Exception("User not found");
        user.Role = Role.Banned;
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUser(Guid id)
    {
        var user = await db.Users.FindAsync(id) ?? throw new Exception("User not found");
        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<object> GetPlatformStats()
    {
        var totalUsers = await db.Users.CountAsync();
        var totalWorkouts = await db.Workouts.CountAsync();
        var totalChallenges = await db.Challenges.CountAsync();
        var totalPosts = await db.Posts.CountAsync();
        return new { totalUsers, totalWorkouts, totalChallenges, totalPosts };
    }

    // ACCOUNT MANAGEMENT
    public async Task<object> UpdateAccount(UpdateAccountRequestDTO dto)
    {
        var userId = userContext.User.userId;
        var user = await db.Users.FindAsync(userId) ?? throw new Exception("User not found");
        if (dto.Username != null) user.Username = dto.Username;
        if (dto.Email != null) user.Email = dto.Email;
        await db.SaveChangesAsync();
        return new { user.Id, user.Username, user.Email, user.Role };
    }

    public async Task<bool> ChangePassword(ChangePasswordRequestDTO dto)
    {
        var userId = userContext.User.userId;
        var user = await db.Users.FindAsync(userId) ?? throw new Exception("User not found");
        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.Password)) throw new Exception("Current password is incorrect");
        user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAccount()
    {
        var userId = userContext.User.userId;
        var user = await db.Users.FindAsync(userId) ?? throw new Exception("User not found");
        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return true;
    }
}
