using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Extensions;
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
    public async Task<IActionResult> GetUser()
    {
        try
        {
            var userResponse = await userService.GetUser();
            if (userResponse != null)
            {
                var response = new ApiResponse<User>(success: true, message: "Successfully retrieved user",
                    statusCode: HttpStatusCode.OK, data: userResponse);
                return response.ToActionResult();
            }
            var errorResponse = new ApiResponse<User>(success: false, message: "Failed to find user",
                statusCode: HttpStatusCode.BadRequest);
            return errorResponse.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<User>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
            return response.ToActionResult();
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateAccountRequestDto user)
    {
        try
        {
            var userResponse = await userService.CreateUser(user);
            var response = new ApiResponse<CreateAccountRequestDto>(success: true, message: "Successfully created user",
                data: userResponse,
                statusCode: HttpStatusCode.Created);
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<CreateAccountRequestDto>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
            return response.ToActionResult();
        }
    }
}
