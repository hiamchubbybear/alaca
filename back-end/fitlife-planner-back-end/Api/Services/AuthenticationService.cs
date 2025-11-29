using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Middlewares;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Util;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Application.Services;

public class AuthenticationService
{
    private readonly ILogger<AuthenticationService> _logger;
    private readonly AppDbContext _db;

    private readonly JwtSigner _jwtSigner;

    // 7 days
    private static readonly long REFRESH_TOKEN_TIME_LIVE = 7;

    public AuthenticationService(ILogger<AuthenticationService> logger, AppDbContext db, JwtSigner jwtSigner)
    {
        _logger = logger;
        _db = db;
        _jwtSigner = jwtSigner;
    }

    public async Task<AuthenticationResponseDto> Authenticate(LoginRequestDto loginRequestDto)
    {
        try
        {
            var email = loginRequestDto.Email.Trim().ToLower();
            var user = _db.Users.FirstOrDefault(u => u.Email.ToLower() == email);
            _logger.LogInformation("[JwtSigner_Authenticate] {}", email);
            if (user == null)
                throw new UnauthorizedAccessException("Email not found");
            _logger.LogInformation("[JwtSigner_Authenticate] {}", user.Email);
            if (!PasswordEncoder.DecodePassword(user.Password, loginRequestDto.Password))
                throw new UnauthorizedAccessException("Password incorrect");
            var profile = _db.Profiles.FirstOrDefault(u => u.UserId == user.Id);
            Guid profileId = profile?.ProfileId ?? Guid.Empty;
            // public record AuthenticationRequestDto(string username, string email, Guid id, Role role, Guid? profileId)
            var authRequestDto = new AuthenticationRequestDto(
                user.Username,
                user.Email,
                user.Id,
                user.Role,
                profileId
            );

            AuthenticationResponseDto tokenResponse = await GenerateToken(authRequestDto);
            _logger.LogInformation("[JwtSigner_Authenticate] {}", tokenResponse);
            return tokenResponse;
        }
        catch (Exception e)
        {
            _logger.LogInformation(e.Message);
            throw new UnauthorizedAccessException("Invalid credentials");
        }
    }


    public async Task<AuthenticationResponseDto> RefreshToken(RefreshTokenRequestDto refreshTokenRequestDto)
    {
        try
        {
            var tokenResponse =
                await _db.Tokens.FirstOrDefaultAsync(t => t.RefreshToken == refreshTokenRequestDto.RefreshToken);
            var userResponse = await _db.Users.FirstOrDefaultAsync(t => t.Id == tokenResponse.UserId);
            var profile = _db.Profiles.FirstOrDefault(u => u.UserId == userResponse.Id);
            if (tokenResponse == null) throw new UnauthorizedAccessException("Refresh token not found");
            if (userResponse == null) throw new UnauthorizedAccessException("User not found");
            AuthenticationRequestDto authenticationRequestDto = new AuthenticationRequestDto(
                userResponse.Username,
                userResponse.Email,
                userResponse.Id,
                userResponse.Role,
                profile.ProfileId
            );
            AuthenticationResponseDto authenticationResponseDto = await GenerateToken(authenticationRequestDto);
            return authenticationResponseDto;
        }
        catch (Exception e)
        {
            _logger.LogInformation(e.Message);
            throw new UnauthorizedAccessException("Invalid credentials");
        }
    }

    public async Task<string> GenerateRefreshToken(AuthenticationRequestDto authenticationRequestDto)
    {
        Guid userID = authenticationRequestDto.id;
        string refreshToken = Guid.NewGuid().ToString();

        var existingToken = _db.Tokens.FirstOrDefault(t => t.UserId == userID);

        if (existingToken != null)
        {
            existingToken.RefreshToken = refreshToken;
            existingToken.ExpiryDate = DateTime.Now.AddDays(REFRESH_TOKEN_TIME_LIVE);
            _db.Tokens.Update(existingToken);
        }
        else
        {
            var token = new Token(
                refreshToken,
                userID,
                DateTime.Now.AddDays(REFRESH_TOKEN_TIME_LIVE)
            );
            _db.Tokens.Add(token);
        }

        await _db.SaveChangesAsync();
        return refreshToken;
    }

    public async Task<AuthenticationResponseDto> GenerateToken(AuthenticationRequestDto authenticationRequestDto)
    {
        string token = _jwtSigner.SignKey(authenticationRequestDto);
        string refreshToken = await GenerateRefreshToken(authenticationRequestDto);
        _logger.LogInformation("[JwtSigner_GenerateToken] {}", token);
        return new AuthenticationResponseDto(
            token,
            refreshToken
        );
    }
}