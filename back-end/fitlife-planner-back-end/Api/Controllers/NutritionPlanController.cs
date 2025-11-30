using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
    public async Task<ApiResponse<List<GetNutritionPlanResponseDTO>>> GetMyNutritionPlans()
    {
        try
        {
            var plans = await _nutritionPlanService.GetMyNutritionPlans();
            return new ApiResponse<List<GetNutritionPlanResponseDTO>>(
                success: true,
                message: "Successfully retrieved nutrition plans",
                data: plans,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<List<GetNutritionPlanResponseDTO>>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<GetNutritionPlanResponseDTO>> GetNutritionPlanById(Guid id)
    {
        try
        {
            var plan = await _nutritionPlanService.GetNutritionPlanById(id);
            return new ApiResponse<GetNutritionPlanResponseDTO>(
                success: true,
                message: "Successfully retrieved nutrition plan",
                data: plan,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<GetNutritionPlanResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.NotFound
            );
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ApiResponse<GetNutritionPlanResponseDTO>> CreateNutritionPlan([FromBody] CreateNutritionPlanRequestDTO dto)
    {
        try
        {
            var plan = await _nutritionPlanService.CreateNutritionPlan(dto);
            return new ApiResponse<GetNutritionPlanResponseDTO>(
                success: true,
                message: "Successfully created nutrition plan",
                data: plan,
                statusCode: HttpStatusCode.Created
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<GetNutritionPlanResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize]
    [HttpPost("{id:guid}/items")]
    public async Task<ApiResponse<GetNutritionPlanItemResponseDTO>> AddItemToPlan(Guid id, [FromBody] AddNutritionPlanItemRequestDTO dto)
    {
        try
        {
            var item = await _nutritionPlanService.AddItemToPlan(id, dto);
            return new ApiResponse<GetNutritionPlanItemResponseDTO>(
                success: true,
                message: "Successfully added item to nutrition plan",
                data: item,
                statusCode: HttpStatusCode.Created
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<GetNutritionPlanItemResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<ApiResponse<bool>> DeleteNutritionPlan(Guid id)
    {
        try
        {
            var result = await _nutritionPlanService.DeleteNutritionPlan(id);
            return new ApiResponse<bool>(
                success: true,
                message: "Successfully deleted nutrition plan",
                data: result,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<bool>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }
}
