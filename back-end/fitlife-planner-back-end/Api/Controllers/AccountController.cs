using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Util;
using fitlife_planner_back_end.Application.DTOs;
using fitlife_planner_back_end.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace fitlife_planner_back_end.Api.Controllers;

[Route("account")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly ILogger<AccountController> _logger;
    private readonly UserService _userService;

    public AccountController(ILogger<AccountController> logger, UserService userService)
    {
        _logger = logger;
        _userService = userService;
    }

    [Authorize]
    [HttpGet]
    public ApiResponse<User> GetUser()
    {
        try
        {
            
            var userResponse = _userService.GetUser();
            return new ApiResponse<User>(success: true, message: "Successfully retrieved user",
                statusCode: HttpStatusCode.Found, data: userResponse);
        }
        catch (Exception e)
        {
            return new ApiResponse<User>(success: true, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
        }
    }

    [HttpPost]
    public ApiResponse<CreateAccountRequestDto> CreateUser([FromBody] CreateAccountRequestDto user)
    {
        try
        {
            var userResponse = _userService.CreateUser(user);
            return new ApiResponse<CreateAccountRequestDto>(success: true, message: "Successfully retrieved user", data: userResponse,
                statusCode: HttpStatusCode.Found);
        }
        catch (Exception e)
        {
            return new ApiResponse<CreateAccountRequestDto>(success: true, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
        }
    }
}