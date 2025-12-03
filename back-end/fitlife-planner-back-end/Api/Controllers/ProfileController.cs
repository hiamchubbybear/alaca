using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Extensions;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("profile")]
public class ProfileController(ILogger<ProfileController> logger, ProfileService profileService)
{
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var profileResponse = await profileService.GetMyProfile();
            var response = new ApiResponse<GetProfileResponseDto>(success: true, message: "Successfully retrieved Profile",
                statusCode: HttpStatusCode.OK, data: profileResponse);
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetProfileResponseDto>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
            return response.ToActionResult();
        }
    }

/*
    Deprecated : Reason replace by create user instead
    [HttpPost]
    public async Task<ApiResponse<CreateProfileResponseDto>> CreateProfile([FromBody] CreateProfileRequestDTO profile)
    {
        try
        {
            var profileResponse = await profileService.CreateProfile(profile);
            return new ApiResponse<CreateProfileResponseDto>(success: true, message: "Successfully retrieved Profile",
                data: profileResponse,
                statusCode: HttpStatusCode.Created);
        }
        catch (Exception e)
        {
            return new ApiResponse<CreateProfileResponseDto>(success: true, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
        }
    }
*/

    // [Authorize(Roles = "Admin")]
    [Authorize]
    [HttpGet("all")]
    public async Task<IActionResult> GetAllProfile([FromQuery] PaginationParameters pagination)
    {
        var profiles = await profileService.GetAllProfilesAsync(pagination);
        var response = new ApiResponse<PaginatedList<Profile>>(
            success: true,
            message: "Successfully retrieved profiles",
            data: profiles,
            statusCode: HttpStatusCode.OK
        );
        return response.ToActionResult();
    }


    [HttpPut()]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileRequestDto dto)
    {
        try
        {
            var result = await profileService.UpdateProfile( dto);
            var response = new ApiResponse<UpdateProfileResponseDto>(
                success: true,
                message: "Successfully updated Profile",
                data: result,
                statusCode: HttpStatusCode.OK);
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var errorResponse = new ApiResponse<UpdateProfileResponseDto>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
            return errorResponse.ToActionResult();
        }
    }
}
