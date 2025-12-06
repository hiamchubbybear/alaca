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
    public async Task<IActionResult> GetMyNutritionPlans([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var plans = await _nutritionPlanService.GetMyNutritionPlans(page, pageSize);
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

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateNutritionPlan(Guid id, [FromBody] UpdateNutritionPlanRequestDTO dto)
    {
        try
        {
            var plan = await _nutritionPlanService.UpdateNutritionPlan(id, dto);
            return new ApiResponse<GetNutritionPlanResponseDTO>(success: true, message: "Successfully updated nutrition plan", data: plan, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<GetNutritionPlanResponseDTO>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    [Authorize]
    [HttpPut("{planId:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> UpdatePlanItem(Guid planId, Guid itemId, [FromBody] UpdateNutritionPlanItemRequestDTO dto)
    {
        try
        {
            var item = await _nutritionPlanService.UpdatePlanItem(planId, itemId, dto);
            return new ApiResponse<GetNutritionPlanItemResponseDTO>(success: true, message: "Successfully updated item", data: item, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<GetNutritionPlanItemResponseDTO>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    [Authorize]
    [HttpDelete("{planId:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItemFromPlan(Guid planId, Guid itemId)
    {
        try
        {
            var result = await _nutritionPlanService.RemoveItemFromPlan(planId, itemId);
            return new ApiResponse<bool>(success: true, message: "Successfully removed item", data: result, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<bool>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    [Authorize]
    [HttpGet("{id:guid}/summary")]
    public async Task<IActionResult> GetNutritionSummary(Guid id)
    {
        try
        {
            var summary = await _nutritionPlanService.GetNutritionSummary(id);
            return new ApiResponse<NutritionSummaryDTO>(success: true, message: "Successfully retrieved summary", data: summary, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<NutritionSummaryDTO>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }
}
