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

    public virtual async Task<object> GetAllFoodItems(int page = 1, int pageSize = 20)
    {
        var skip = (page - 1) * pageSize;
        var query = _dbContext.FoodItems;
        var total = await query.CountAsync();
        var foodItems = await query.Skip(skip).Take(pageSize).ToListAsync();
        return new { foodItems = foodItems.Select(f => MapToResponseDTO(f)), total, page, pageSize };
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

    public virtual async Task<GetFoodItemResponseDTO> UpdateFoodItem(Guid id, UpdateFoodItemRequestDTO dto)
    {
        var foodItem = await _dbContext.FoodItems.FindAsync(id) ?? throw new Exception("Food item not found");
        if (dto.Name != null) foodItem.Name = dto.Name;
        if (dto.ServingSize != null) foodItem.ServingSize = dto.ServingSize;
        if (dto.ServingAmount.HasValue) foodItem.ServingAmount = dto.ServingAmount;
        if (dto.CaloriesKcal.HasValue) foodItem.CaloriesKcal = dto.CaloriesKcal;
        if (dto.ProteinG.HasValue) foodItem.ProteinG = dto.ProteinG;
        if (dto.CarbsG.HasValue) foodItem.CarbsG = dto.CarbsG;
        if (dto.FatG.HasValue) foodItem.FatG = dto.FatG;
        if (dto.FiberG.HasValue) foodItem.FiberG = dto.FiberG;
        if (dto.SodiumMg.HasValue) foodItem.SodiumMg = dto.SodiumMg;
        if (dto.Micronutrients != null) foodItem.Micronutrients = dto.Micronutrients;
        foodItem.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();
        return MapToResponseDTO(foodItem);
    }

    private GetFoodItemResponseDTO MapToResponseDTO(FoodItem f)
    {
        return new GetFoodItemResponseDTO
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
        };
    }

    public async Task<object> SearchFoodItems(string query, int page, int pageSize)
    {
        var skip = (page - 1) * pageSize;
        var searchQuery = _dbContext.FoodItems
            .Where(f => f.Name.Contains(query) ||
                       (f.Micronutrients != null && f.Micronutrients.Contains(query)));

        var total = await searchQuery.CountAsync();
        var foodItems = await searchQuery.Skip(skip).Take(pageSize).ToListAsync();

        return new {
            foodItems = foodItems.Select(f => MapToResponseDTO(f)),
            total,
            page,
            pageSize
        };
    }
}
