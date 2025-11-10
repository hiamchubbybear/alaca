using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.Middlewares;
using fitlife_planner_back_end.Api.Util;
using fitlife_planner_back_end.Application.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthenticationController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtSigner _jwtSigner;

    public AuthenticationController(AppDbContext db, JwtSigner signer)
    {
        _db = db;
        _jwtSigner = signer;
    }

    // Vay thi im me mom
    [HttpPost("login")]
    public ApiResponse<string> Login([FromBody] LoginRequestDto loginRequest)
    {
        if (string.IsNullOrWhiteSpace(loginRequest.Email) ||
            string.IsNullOrWhiteSpace(loginRequest.Password))
        {
            return new ApiResponse<string>(
                success: false,
                statusCode: HttpStatusCode.BadRequest,
                message: "Email and password are required"
            );
        }

        var email = loginRequest.Email.Trim().ToLower();
        var user = _db.Users.AsNoTracking().FirstOrDefault(u => u.Email.ToLower() == email);

        if (user == null)
        {
            return new ApiResponse<string>(
                success: false,
                statusCode: HttpStatusCode.Unauthorized,
                message: "Email not found"
            );
        }

        if (!PasswordEncoder.DecodePassword(user.Password, loginRequest.Password))
        {
            return new ApiResponse<string>(
                success: false,
                statusCode: HttpStatusCode.Unauthorized,
                message: "Password incorrect"
            );
        }

        AuthenticationDto authDto = new AuthenticationDto(user.Username, user.Email, id: user.Id);
        String token = _jwtSigner.GenerateToken(authDto);
        return new ApiResponse<string>(
            success: true,
            statusCode: HttpStatusCode.OK,
            data: token,
            message: "Login successful"
        );
    }
}