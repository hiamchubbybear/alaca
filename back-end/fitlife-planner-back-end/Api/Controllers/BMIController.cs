using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using fitlife_planner_back_end.Api.Extensions;


namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("bmi")]
public class BmiController(ILogger<BmiController> logger, BMIService bmiService)
{
    [Authorize]
    [HttpPost("calculate")]
    public async Task<IActionResult> CalculateBmi(
        [FromBody] CreateBMIRecordRequestDto dto)
    {
        try
        {
            var bmiResult = await bmiService.CreateBMIRecord(dto);

            var response = new ApiResponse<CreateBMIResponseDto>(
                success: true,
                message: "BMI calculated successfully",
                data: bmiResult,
                statusCode: HttpStatusCode.Created
            );;


            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<CreateBMIResponseDto>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpPost("me")]
    public async Task<IActionResult> GetMyLatestBmi([FromBody] ChoosePlanRequestDto requestDto)
    {
        try
        {
            var result = await bmiService.ChoosePlan(requestDto);

            var response = new ApiResponse<ChoosePlanResponseDto>(
                success: true,
                message: "Successfully retrieved BMI",
                data: result,
                statusCode: HttpStatusCode.OK
            );;


            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<ChoosePlanResponseDto>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    // [Authorize(Roles = "Admin")]
    // [HttpGet("user/{userId}")]
    // public async Task<IActionResult> GetBMIByUserId(Guid userId)
    // {
    //     try
    //     {
    //         var result = await _bmiService.GetBMIsByUserId(userId);
    //
    //         var response = new ApiResponse<List<GetBmiResponseDto>>(
    //             success: true,
    //             message: "Successfully retrieved BMI records",
    //             data: result,
    //             statusCode: HttpStatusCode.OK
    //         );
    //         return response.ToActionResult();
    //     }
    //     catch (Exception e)
    //     {
    //         var response = new ApiResponse<List<GetBmiResponseDto>>(
    //             success: false,
    //             message: e.Message,
    //             statusCode: HttpStatusCode.BadRequest
    //         );
    //         return response.ToActionResult();
    //     }
    // }

    // [Authorize(Roles = "Admin")]
    // [HttpGet("all")]
    // public async Task<IActionResult> GetAllBMI(
    //     [FromQuery] PaginationParameters pagination)
    // {
    //     try
    //     {
    //         var result = await _bmiService.GetAllBMI(pagination);
    //
    //         var response = new ApiResponse<PaginatedList<BmiRecord>>(
    //             success: true,
    //             message: "Successfully retrieved BMI records",
    //             data: result,
    //             statusCode: HttpStatusCode.OK
    //         );
    //         return response.ToActionResult();
    //     }
    //     catch (Exception e)
    //     {
    //         var response = new ApiResponse<PaginatedList<BmiRecord>>(
    //             success: false,
    //             message: e.Message,
    //             statusCode: HttpStatusCode.BadRequest
    //         );
    //         return response.ToActionResult();
    //     }
    // }
}
