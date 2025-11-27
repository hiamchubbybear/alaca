using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.Middlewares;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Responses;
using fitlife_planner_back_end.Api.Util;
using fitlife_planner_back_end.Application.DTOs;
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
        var email = loginRequestDto.Email.Trim().ToLower();
        var user = _db.Users.FirstOrDefault(u => u.Email.ToLower() == email);
        _logger.LogInformation("[JwtSigner_Authenticate_Hashed] {}", user.Password);
        _logger.LogInformation("[JwtSigner_Authenticate_Raw] {}", loginRequestDto.Password);
        if (user == null)
            throw new UnauthorizedAccessException("Email not found");
        if (!PasswordEncoder.DecodePassword(user.Password, loginRequestDto.Password))
            throw new UnauthorizedAccessException("Password incorrect");

        var authRequestDto = new AuthenticationRequestDto(user.Username, user.Email, user.Id, user.Role);
        AuthenticationResponseDto tokenResponse = await GenerateToken(authRequestDto);
        _logger.LogInformation("[JwtSigner_Authenticate] {}", tokenResponse);
        return tokenResponse;
    }

    public async Task<AuthenticationResponseDto> RefreshToken(RefreshTokenRequestDto refreshTokenRequestDto)
    {
        var tokenResponse =
            await _db.Tokens.FirstOrDefaultAsync(t => t.RefreshToken == refreshTokenRequestDto.RefreshToken);
        var userResponse = await _db.Users.FirstOrDefaultAsync(t => t.Id == tokenResponse.UserId);
        if (tokenResponse == null) throw new UnauthorizedAccessException("Refresh token not found");
        if (userResponse == null) throw new UnauthorizedAccessException("User not found");
        AuthenticationRequestDto authenticationRequestDto = new AuthenticationRequestDto(
            userResponse.Username,
            userResponse.Email,
            userResponse.Id,
            userResponse.Role
        );
        AuthenticationResponseDto authenticationResponseDto = await GenerateToken(authenticationRequestDto);
        return authenticationResponseDto;
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