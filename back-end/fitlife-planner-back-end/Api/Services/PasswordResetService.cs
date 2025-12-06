using System.Security.Cryptography;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Util;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Services;

public class PasswordResetService
{
    private readonly AppDbContext _dbContext;
    private readonly EmailService _emailService;
    private readonly ILogger<PasswordResetService> _logger;

    public PasswordResetService(
        AppDbContext dbContext,
        EmailService emailService,
        ILogger<PasswordResetService> logger)
    {
        _dbContext = dbContext;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<bool> GenerateResetToken(string email)
    {
        try
        {
            // Find user by email
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            // Always return true for security (don't reveal if email exists)
            if (user == null)
            {
                _logger.LogWarning("Password reset requested for non-existent email: {Email}", email);
                return true; // Don't reveal that email doesn't exist
            }

            // Generate secure random token
            var token = GenerateSecureToken();

            // Create reset token record
            var resetToken = new PasswordResetToken(user.Id, token, expirationMinutes: 15);

            await _dbContext.PasswordResetTokens.AddAsync(resetToken);
            await _dbContext.SaveChangesAsync();

            // Send email
            var emailSent = await _emailService.SendPasswordResetEmail(
                user.Email,
                user.Username,
                token
            );

            if (!emailSent)
            {
                _logger.LogError("Failed to send password reset email to {Email}", email);
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating password reset token for {Email}", email);
            return false;
        }
    }

    public async Task<bool> ValidateResetToken(string token)
    {
        try
        {
            var resetToken = await _dbContext.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.Token == token);

            if (resetToken == null)
            {
                return false;
            }

            return resetToken.IsValid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating reset token");
            return false;
        }
    }

    public async Task<(bool Success, string Message)> ResetPassword(string token, string newPassword)
    {
        try
        {
            // Find token
            var resetToken = await _dbContext.PasswordResetTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == token);

            if (resetToken == null)
            {
                return (false, "Invalid reset token");
            }

            // Validate token
            if (!resetToken.IsValid())
            {
                if (resetToken.IsUsed)
                {
                    return (false, "This reset link has already been used");
                }
                else
                {
                    return (false, "This reset link has expired");
                }
            }

            // Validate password strength (basic validation)
            if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
            {
                return (false, "Password must be at least 6 characters long");
            }

            // Hash new password
            var hashedPassword = PasswordEncoder.EncodePassword(newPassword);

            // Update user password
            resetToken.User.Password = hashedPassword;

            // Mark token as used
            resetToken.IsUsed = true;

            // Revoke all other tokens for this user
            var otherTokens = await _dbContext.PasswordResetTokens
                .Where(t => t.UserId == resetToken.UserId && t.Id != resetToken.Id && !t.IsUsed)
                .ToListAsync();

            foreach (var otherToken in otherTokens)
            {
                otherToken.IsUsed = true;
            }

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Password successfully reset for user {UserId}", resetToken.UserId);

            return (true, "Password reset successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password");
            return (false, "An error occurred while resetting your password");
        }
    }

    public async Task CleanupExpiredTokens()
    {
        try
        {
            var expiredTokens = await _dbContext.PasswordResetTokens
                .Where(t => t.ExpiresAt < DateTime.UtcNow || t.IsUsed)
                .ToListAsync();

            if (expiredTokens.Any())
            {
                _dbContext.PasswordResetTokens.RemoveRange(expiredTokens);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Cleaned up {Count} expired/used password reset tokens", expiredTokens.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up expired tokens");
        }
    }

    private string GenerateSecureToken()
    {
        // Generate 32 bytes of random data
        var randomBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }

        // Convert to base64 URL-safe string
        return Convert.ToBase64String(randomBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }
}
