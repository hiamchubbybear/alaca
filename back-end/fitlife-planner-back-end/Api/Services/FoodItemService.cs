using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Services;

public class FoodItemService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<FoodItemService> _logger;
    private readonly IUserContext _userContext;

    public FoodItemService(AppDbContext dbContext, ILogger<FoodItemService> logger, IUserContext userContext)
    {
        _dbContext = dbContext;
        _logger = logger;
        _userContext = userContext;
    }

    public virtual async Task<List<GetFoodItemResponseDTO>> GetAllFoodItems()
    {
        var foodItems = await _dbContext.FoodItems.ToListAsync();
        return foodItems.Select(f => new GetFoodItemResponseDTO
        {
            Id = f.Id,
            Name = f.Name,
            ServingSize = f.ServingSize,
            ServingAmount = f.ServingAmount,
            CaloriesKcal = f.CaloriesKcal,
            ProteinG = f.ProteinG,
            CarbsG = f.CarbsG,
            FatG = f.FatG,
            FiberG = f.FiberG,
            SodiumMg = f.SodiumMg,
            Micronutrients = f.Micronutrients,
            CreatedAt = f.CreatedAt
        }).ToList();
    }

    public virtual async Task<GetFoodItemResponseDTO> GetFoodItemById(Guid id)
    {
        var foodItem = await _dbContext.FoodItems.FindAsync(id)
            ?? throw new Exception("Food item not found");

        return new GetFoodItemResponseDTO
        {
            Id = foodItem.Id,
            Name = foodItem.Name,
            ServingSize = foodItem.ServingSize,
            ServingAmount = foodItem.ServingAmount,
            CaloriesKcal = foodItem.CaloriesKcal,
            ProteinG = foodItem.ProteinG,
            CarbsG = foodItem.CarbsG,
            FatG = foodItem.FatG,
            FiberG = foodItem.FiberG,
            SodiumMg = foodItem.SodiumMg,
            Micronutrients = foodItem.Micronutrients,
            CreatedAt = foodItem.CreatedAt
        };
    }

    public virtual async Task<GetFoodItemResponseDTO> CreateFoodItem(CreateFoodItemRequestDTO dto)
    {
        var foodItem = new FoodItem
        {
            Name = dto.Name,
            ServingSize = dto.ServingSize,
            ServingAmount = dto.ServingAmount,
            CaloriesKcal = dto.CaloriesKcal,
            ProteinG = dto.ProteinG,
            CarbsG = dto.CarbsG,
            FatG = dto.FatG,
            FiberG = dto.FiberG,
            SodiumMg = dto.SodiumMg,
            Micronutrients = dto.Micronutrients
        };

        await _dbContext.FoodItems.AddAsync(foodItem);
        await _dbContext.SaveChangesAsync();

        return new GetFoodItemResponseDTO
        {
            Id = foodItem.Id,
            Name = foodItem.Name,
            ServingSize = foodItem.ServingSize,
            ServingAmount = foodItem.ServingAmount,
            CaloriesKcal = foodItem.CaloriesKcal,
            ProteinG = foodItem.ProteinG,
            CarbsG = foodItem.CarbsG,
            FatG = foodItem.FatG,
            FiberG = foodItem.FiberG,
            SodiumMg = foodItem.SodiumMg,
            Micronutrients = foodItem.Micronutrients,
            CreatedAt = foodItem.CreatedAt
        };
    }

    public virtual async Task<bool> DeleteFoodItem(Guid id)
    {
        var foodItem = await _dbContext.FoodItems.FindAsync(id)
            ?? throw new Exception("Food item not found");

        _dbContext.FoodItems.Remove(foodItem);
        await _dbContext.SaveChangesAsync();
        return true;
    }
}
