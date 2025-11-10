using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Util;
using Microsoft.AspNetCore.Mvc;

namespace fitlife_planner_back_end.Api.Controllers;

[Route("account")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly ILogger<AccountController> _logger;
    private readonly AppDbContext _db;

    public AccountController(AppDbContext _db_ct, ILogger<AccountController> logger_ct)
    {
        _db = _db_ct;
        _logger = logger_ct;
    }

    [HttpGet]
    public ApiResponse<User> GetUser(Guid userId)
    {
        var user = _db.Users.FirstOrDefault(u => userId == userId);
        if (user == null)
            return new ApiResponse<User>(success: false, message: "User not found",
                statusCode: HttpStatusCode.NotFound);
        return new ApiResponse<User>(success: true, message: "Successfully retrieved user",
            statusCode: HttpStatusCode.Found);
    }

    [HttpPost]
    public ApiResponse<User> CreateUser([FromBody]User user)
    {
        try
        {
            user.Password = PasswordEncoder.EncodePassword(user.Password);
            _db.Users.Add(user);
            _db.SaveChanges();
            return new ApiResponse<User>(success: true, message: "Successfully retrieved user", data: user,
                statusCode: HttpStatusCode.Found);
        }
        catch (Exception e)
        {
            _logger.LogError("[AccountController_Error] {}", e.Message);
            return new ApiResponse<User>(success: true, message: "Create account failed",
                statusCode: HttpStatusCode.BadRequest);
        }
    }
}