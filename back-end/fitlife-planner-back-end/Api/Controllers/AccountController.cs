using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Util;
using fitlife_planner_back_end.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace fitlife_planner_back_end.Api.Controllers;

[Route("account")]
[ApiController]
public class AccountController(ILogger<AccountController> logger, UserService userService) : ControllerBase
{
    [Authorize]
    [HttpGet]
    public async Task<ApiResponse<User>> GetUser()
    {
        try
        {
            var userResponse = await userService.GetUser();
            if (userResponse != null)
                return new ApiResponse<User>(success: true, message: "Successfully retrieved user",
                    statusCode: HttpStatusCode.Found, data: userResponse);
            return new ApiResponse<User>(success: true, message: "Failed to find user",
                statusCode: HttpStatusCode.BadRequest);
        }
        catch (Exception e)
        {
            return new ApiResponse<User>(success: true, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
        }
    }

    [HttpPost]
    public async Task<ApiResponse<CreateAccountRequestDto>> CreateUser([FromBody] CreateAccountRequestDto user)
    {
        try
        {
            var userResponse = await userService.CreateUser(user);
            return new ApiResponse<CreateAccountRequestDto>(success: true, message: "Successfully retrieved user",
                data: userResponse,
                statusCode: HttpStatusCode.Found);
        }
        catch (Exception e)
        {
            return new ApiResponse<CreateAccountRequestDto>(success: true, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
        }
    }
}