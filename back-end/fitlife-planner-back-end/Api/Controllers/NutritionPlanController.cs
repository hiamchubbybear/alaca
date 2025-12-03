using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using fitlife_planner_back_end.Api.Extensions;


namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("nutrition-plans")]
public class NutritionPlanController : ControllerBase
{
    private readonly NutritionPlanService _nutritionPlanService;
    private readonly ILogger<NutritionPlanController> _logger;

    public NutritionPlanController(NutritionPlanService nutritionPlanService, ILogger<NutritionPlanController> logger)
    {
        _nutritionPlanService = nutritionPlanService;
        _logger = logger;
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyNutritionPlans()
    {
        try
        {
            var plans = await _nutritionPlanService.GetMyNutritionPlans();
            var response = new ApiResponse<List<GetNutritionPlanResponseDTO>>(
                success: true,
                message: "Successfully retrieved nutrition plans",
                data: plans,
                statusCode: HttpStatusCode.OK
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<List<GetNutritionPlanResponseDTO>>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetNutritionPlanById(Guid id)
    {
        try
        {
            var plan = await _nutritionPlanService.GetNutritionPlanById(id);
            var response = new ApiResponse<GetNutritionPlanResponseDTO>(
                success: true,
                message: "Successfully retrieved nutrition plan",
                data: plan,
                statusCode: HttpStatusCode.OK
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetNutritionPlanResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.NotFound
            );;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateNutritionPlan([FromBody] CreateNutritionPlanRequestDTO dto)
    {
        try
        {
            var plan = await _nutritionPlanService.CreateNutritionPlan(dto);
            var response = new ApiResponse<GetNutritionPlanResponseDTO>(
                success: true,
                message: "Successfully created nutrition plan",
                data: plan,
                statusCode: HttpStatusCode.Created
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetNutritionPlanResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddItemToPlan(Guid id, [FromBody] AddNutritionPlanItemRequestDTO dto)
    {
        try
        {
            var item = await _nutritionPlanService.AddItemToPlan(id, dto);
            var response = new ApiResponse<GetNutritionPlanItemResponseDTO>(
                success: true,
                message: "Successfully added item to nutrition plan",
                data: item,
                statusCode: HttpStatusCode.Created
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetNutritionPlanItemResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteNutritionPlan(Guid id)
    {
        try
        {
            var result = await _nutritionPlanService.DeleteNutritionPlan(id);
            var response = new ApiResponse<bool>(
                success: true,
                message: "Successfully deleted nutrition plan",
                data: result,
                statusCode: HttpStatusCode.OK
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<bool>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }
}
