using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Requests;
using fitlife_planner_back_end.Api.Enums;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Util;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Services;

public class GoogleAuthService
{
    private readonly AppDbContext _db;
    private readonly GoogleOAuthSettings _settings;
    private readonly ILogger<GoogleAuthService> _logger;
    private readonly ProfileService _profileService;

    public GoogleAuthService(
        AppDbContext db,
        GoogleOAuthSettings settings,
        ILogger<GoogleAuthService> logger,
        ProfileService profileService)
    {
        _db = db;
        _settings = settings;
        _logger = logger;
        _profileService = profileService;
    }


    /// <summary>
    /// Verifies Google ID token and extracts user information
    /// </summary>
    public async Task<GoogleUserInfo> VerifyGoogleToken(string idToken)
    {
        try
        {
            var validationSettings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _settings.ClientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, validationSettings);

            return new GoogleUserInfo
            {
                Email = payload.Email,
                Name = payload.Name,
                GoogleId = payload.Subject,
                Picture = payload.Picture,
                EmailVerified = payload.EmailVerified
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to verify Google token");
            throw new UnauthorizedAccessException("Invalid Google token");
        }
    }

    /// <summary>
    /// Gets existing user or creates a new one based on Google user info
    /// </summary>
    public async Task<User> GetOrCreateGoogleUser(GoogleUserInfo googleUserInfo)
    {
        try
        {
            // First, try to find user by GoogleId
            var user = await _db.Users.FirstOrDefaultAsync(u => u.GoogleId == googleUserInfo.GoogleId);

            if (user != null)
            {
                _logger.LogInformation("Found existing user by GoogleId: {Email}", googleUserInfo.Email);
                return user;
            }

            // If not found by GoogleId, try to find by email
            var emailLower = googleUserInfo.Email.Trim().ToLower();
            user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == emailLower);

            if (user != null)
            {
                // User exists with this email but no GoogleId - link the accounts
                _logger.LogInformation("Linking existing email account to Google: {Email}", googleUserInfo.Email);
                user.GoogleId = googleUserInfo.GoogleId;
                user.IsVerified = true; // Google emails are verified
                _db.Users.Update(user);
                await _db.SaveChangesAsync();
                return user;
            }

            // Create new user
            _logger.LogInformation("Creating new user from Google account: {Email}", googleUserInfo.Email);

            // Generate a random password for OAuth users (they won't use it)
            var randomPassword = Guid.NewGuid().ToString();

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Username = googleUserInfo.Name,
                Email = googleUserInfo.Email,
                Password = PasswordEncoder.EncodePassword(randomPassword),
                GoogleId = googleUserInfo.GoogleId,
                IsVerified = true, // Google emails are pre-verified
                Role = Role.User,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Version = 1
            };

            _db.Users.Add(newUser);
            await _db.SaveChangesAsync();

            // Create profile for new Google user (same as regular signup)
            await _profileService.CreateProfile(
                new fitlife_planner_back_end.Api.DTOs.Resquests.CreateProfileRequestDTO(googleUserInfo.Name),
                newUser.Id
            );

            _logger.LogInformation("Successfully created new Google user with profile: {UserId}", newUser.Id);
            return newUser;

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetOrCreateGoogleUser for email: {Email}", googleUserInfo.Email);
            throw;
        }
    }
}
