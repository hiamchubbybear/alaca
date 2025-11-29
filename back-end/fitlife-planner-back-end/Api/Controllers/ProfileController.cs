using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
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
    public async Task<ApiResponse<GetProfileResponseDto>> GetProfile()
    {
        try
        {
            var profileResponse = await profileService.GetMyProfile();
            return new ApiResponse<GetProfileResponseDto>(success: true, message: "Successfully retrieved Profile",
                statusCode: HttpStatusCode.Found, data: profileResponse);
        }
        catch (Exception e)
        {
            return new ApiResponse<GetProfileResponseDto>(success: true, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
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
    public async Task<ApiResponse<PaginatedList<Profile>>> GetAllProfile([FromQuery] PaginationParameters pagination)
    {
        var profiles = await profileService.GetAllProfilesAsync(pagination);

        return await Task.FromResult(new ApiResponse<PaginatedList<Profile>>(
            success: true,
            message: "Successfully retrieved profiles",
            data: profiles,
            statusCode: HttpStatusCode.OK
        ));
    }


    [HttpPut()]
    public async Task<ApiResponse<UpdateProfileResponseDto>> UpdateProfile(
        [FromBody] UpdateProfileRequestDto dto)
    {
        try
        {
            var result = await profileService.UpdateProfile( dto);
            return new ApiResponse<UpdateProfileResponseDto>(
                success: true,
                message: "Successfully updated Profile",
                data: result,
                statusCode: HttpStatusCode.OK);
        }
        catch (Exception e)
        {
            return new ApiResponse<UpdateProfileResponseDto>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
        }
    }
}