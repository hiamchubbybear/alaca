using System.Security.Authentication;
using System.Security.Claims;
using fitlife_planner_back_end.Api.DTOs;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;

namespace fitlife_planner_back_end.Api.Util;

public class UserContext : IUserContext
{
    private readonly IHttpContextAccessor _http;
    private readonly ILogger<UserContext> _logger;

    public UserContext(IHttpContextAccessor http, ILogger<UserContext> logger)
    {
        _http = http;
        _logger = logger;
    }

    public UserJwtInfo User
    {
        get
        {
            var claims = _http.HttpContext?.User ?? throw new AuthenticationException("No HttpContext");
            foreach (var c in claims.Claims)
                _logger.LogInformation($"Claim: {c.Type}={c.Value}");
            var userId = Guid.Parse(claims.FindFirst("iiss")?.Value
                                    ?? throw new AuthenticationException("User ID not found"));
            if (String.IsNullOrWhiteSpace(userId.ToString()))
            {
                throw new Exception("Invalid UserId");
            }
            var username = claims.FindFirst("iss")?.Value
                           ?? throw new AuthenticationException("Username not found");

            var email = claims.FindFirst(ClaimTypes.Email)?.Value
                        ?? claims.FindFirst("email")?.Value
                        ?? throw new AuthenticationException("Email not found");


            var tokenExp = claims.FindFirst("tokenExp")?.Value;
            long expUnix = tokenExp != null ? long.Parse(tokenExp) : 0;
            var expDate = DateTimeOffset.FromUnixTimeMilliseconds(expUnix);

            if (expDate < DateTimeOffset.UtcNow)
                throw new AuthenticationException("Token has expired");

            return new UserJwtInfo(userId, username, email);
        }
    }
}