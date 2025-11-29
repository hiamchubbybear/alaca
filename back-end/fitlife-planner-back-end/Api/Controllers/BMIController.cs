using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("bmi")]
public class BmiController(ILogger<BmiController> logger, BMIService bmiService)
{
    [Authorize]
    [HttpPost("calculate")]
    public async Task<ApiResponse<CreateBMIResponseDto>> CalculateBmi(
        [FromBody] CreateBMIRecordRequestDto dto)
    {
        try
        {
            var bmiResult = await bmiService.CreateBMIRecord(dto);

            return new ApiResponse<CreateBMIResponseDto>(
                success: true,
                message: "BMI calculated successfully",
                data: bmiResult,
                statusCode: HttpStatusCode.Created
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<CreateBMIResponseDto>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize]
    [HttpPost("me")]
    public async Task<ApiResponse<ChoosePlanResponseDto>> GetMyLatestBmi([FromBody] ChoosePlanRequestDto requestDto)
    {
        try
        {
            var result = await bmiService.ChoosePlan(requestDto);

            return new ApiResponse<ChoosePlanResponseDto>(
                success: true,
                message: "Successfully retrieved BMI",
                data: result,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<ChoosePlanResponseDto>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    // [Authorize(Roles = "Admin")]
    // [HttpGet("user/{userId}")]
    // public async Task<ApiResponse<List<GetBmiResponseDto>>> GetBMIByUserId(Guid userId)
    // {
    //     try
    //     {
    //         var result = await _bmiService.GetBMIsByUserId(userId);
    //
    //         return new ApiResponse<List<GetBmiResponseDto>>(
    //             success: true,
    //             message: "Successfully retrieved BMI records",
    //             data: result,
    //             statusCode: HttpStatusCode.OK
    //         );
    //     }
    //     catch (Exception e)
    //     {
    //         return new ApiResponse<List<GetBmiResponseDto>>(
    //             success: false,
    //             message: e.Message,
    //             statusCode: HttpStatusCode.BadRequest
    //         );
    //     }
    // }

    // [Authorize(Roles = "Admin")]
    // [HttpGet("all")]
    // public async Task<ApiResponse<PaginatedList<BmiRecord>>> GetAllBMI(
    //     [FromQuery] PaginationParameters pagination)
    // {
    //     try
    //     {
    //         var result = await _bmiService.GetAllBMI(pagination);
    //
    //         return new ApiResponse<PaginatedList<BmiRecord>>(
    //             success: true,
    //             message: "Successfully retrieved BMI records",
    //             data: result,
    //             statusCode: HttpStatusCode.OK
    //         );
    //     }
    //     catch (Exception e)
    //     {
    //         return new ApiResponse<PaginatedList<BmiRecord>>(
    //             success: false,
    //             message: e.Message,
    //             statusCode: HttpStatusCode.BadRequest
    //         );
    //     }
    // }
}