using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("food-items")]
public class FoodItemController : ControllerBase
{
    private readonly FoodItemService _foodItemService;
    private readonly ILogger<FoodItemController> _logger;

    public FoodItemController(FoodItemService foodItemService, ILogger<FoodItemController> logger)
    {
        _foodItemService = foodItemService;
        _logger = logger;
    }

    [Authorize]
    [HttpGet]
    public async Task<ApiResponse<List<GetFoodItemResponseDTO>>> GetAllFoodItems()
    {
        try
        {
            var foodItems = await _foodItemService.GetAllFoodItems();
            return new ApiResponse<List<GetFoodItemResponseDTO>>(
                success: true,
                message: "Successfully retrieved food items",
                data: foodItems,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<List<GetFoodItemResponseDTO>>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<GetFoodItemResponseDTO>> GetFoodItemById(Guid id)
    {
        try
        {
            var foodItem = await _foodItemService.GetFoodItemById(id);
            return new ApiResponse<GetFoodItemResponseDTO>(
                success: true,
                message: "Successfully retrieved food item",
                data: foodItem,
                statusCode: HttpStatusCode.OK
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<GetFoodItemResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.NotFound
            );
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ApiResponse<GetFoodItemResponseDTO>> CreateFoodItem([FromBody] CreateFoodItemRequestDTO dto)
    {
        try
        {
            var foodItem = await _foodItemService.CreateFoodItem(dto);
            return new ApiResponse<GetFoodItemResponseDTO>(
                success: true,
                message: "Successfully created food item",
                data: foodItem,
                statusCode: HttpStatusCode.Created
            );
        }
        catch (Exception e)
        {
            return new ApiResponse<GetFoodItemResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<ApiResponse<bool>> DeleteFoodItem(Guid id)
    {
        try
        {
            var result = await _foodItemService.DeleteFoodItem(id);
            return new ApiResponse<bool>(
                success: true,
                message: "Successfully deleted food item",
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
