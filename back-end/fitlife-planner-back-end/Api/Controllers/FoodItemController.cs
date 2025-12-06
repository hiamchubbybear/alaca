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
    public async Task<IActionResult> GetAllFoodItems([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var foodItems = await _foodItemService.GetAllFoodItems(page, pageSize);
            var response = new ApiResponse<List<GetFoodItemResponseDTO>>(
                success: true,
                message: "Successfully retrieved food items",
                data: foodItems,
                statusCode: HttpStatusCode.OK
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<List<GetFoodItemResponseDTO>>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetFoodItemById(Guid id)
    {
        try
        {
            var foodItem = await _foodItemService.GetFoodItemById(id);
            var response = new ApiResponse<GetFoodItemResponseDTO>(
                success: true,
                message: "Successfully retrieved food item",
                data: foodItem,
                statusCode: HttpStatusCode.OK
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetFoodItemResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.NotFound
            );;

            return response.ToActionResult();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateFoodItem([FromBody] CreateFoodItemRequestDTO dto)
    {
        try
        {
            var foodItem = await _foodItemService.CreateFoodItem(dto);
            var response = new ApiResponse<GetFoodItemResponseDTO>(
                success: true,
                message: "Successfully created food item",
                data: foodItem,
                statusCode: HttpStatusCode.Created
            );;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetFoodItemResponseDTO>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );;

            return response.ToActionResult();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteFoodItem(Guid id)
    {
        try
        {
            var result = await _foodItemService.DeleteFoodItem(id);
            var response = new ApiResponse<bool>(
                success: true,
                message: "Successfully deleted food item",
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

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateFoodItem(Guid id, [FromBody] UpdateFoodItemRequestDTO dto)
    {
        try
        {
            var foodItem = await _foodItemService.UpdateFoodItem(id, dto);
            return new ApiResponse<GetFoodItemResponseDTO>(success: true, message: "Successfully updated food item", data: foodItem, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<GetFoodItemResponseDTO>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }

    [Authorize]
    [HttpGet("search")]
    public async Task<IActionResult> SearchFoodItems([FromQuery] string query, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var foodItems = await _foodItemService.SearchFoodItems(query, page, pageSize);
            return new ApiResponse<object>(success: true, message: "Successfully searched food items", data: foodItems, statusCode: HttpStatusCode.OK).ToActionResult();
        }
        catch (Exception e)
        {
            return new ApiResponse<object>(success: false, message: e.Message, statusCode: HttpStatusCode.BadRequest).ToActionResult();
        }
    }
}
