using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Services;

public class NutritionPlanService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<NutritionPlanService> _logger;
    private readonly IUserContext _userContext;

    public NutritionPlanService(AppDbContext dbContext, ILogger<NutritionPlanService> logger, IUserContext userContext)
    {
        _dbContext = dbContext;
        _logger = logger;
        _userContext = userContext;
    }

    public async Task<List<GetNutritionPlanResponseDTO>> GetMyNutritionPlans()
    {
        var userId = _userContext.User.userId;
        var plans = await _dbContext.NutritionPlans
            .Include(p => p.Items)
            .ThenInclude(i => i.FoodItem)
            .Where(p => p.OwnerUserId == userId)
            .ToListAsync();

        return plans.Select(p => MapToResponseDTO(p)).ToList();
    }

    public async Task<GetNutritionPlanResponseDTO> GetNutritionPlanById(Guid id)
    {
        var userId = _userContext.User.userId;
        var plan = await _dbContext.NutritionPlans
            .Include(p => p.Items)
            .ThenInclude(i => i.FoodItem)
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new Exception("Nutrition plan not found");

        // Check visibility
        if (plan.OwnerUserId != userId && plan.Visibility == "private")
            throw new UnauthorizedAccessException("You don't have access to this plan");

        return MapToResponseDTO(plan);
    }

    public async Task<GetNutritionPlanResponseDTO> CreateNutritionPlan(CreateNutritionPlanRequestDTO dto)
    {
        var userId = _userContext.User.userId;
        var plan = new NutritionPlan
        {
            OwnerUserId = userId,
            Title = dto.Title,
            Description = dto.Description,
            CaloriesTargetKcal = dto.CaloriesTargetKcal,
            Macros = dto.Macros,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Visibility = dto.Visibility ?? "private"
        };

        await _dbContext.NutritionPlans.AddAsync(plan);
        await _dbContext.SaveChangesAsync();

        return MapToResponseDTO(plan);
    }

    public async Task<GetNutritionPlanItemResponseDTO> AddItemToPlan(Guid planId, AddNutritionPlanItemRequestDTO dto)
    {
        var userId = _userContext.User.userId;
        var plan = await _dbContext.NutritionPlans.FindAsync(planId)
            ?? throw new Exception("Nutrition plan not found");

        if (plan.OwnerUserId != userId)
            throw new UnauthorizedAccessException("You don't own this plan");

        var foodItem = await _dbContext.FoodItems.FindAsync(dto.FoodItemId)
            ?? throw new Exception("Food item not found");

        var planItem = new NutritionPlanItem
        {
            PlanId = planId,
            MealTime = dto.MealTime,
            FoodItemId = dto.FoodItemId,
            ServingCount = dto.ServingCount,
            Notes = dto.Notes
        };

        await _dbContext.NutritionPlanItems.AddAsync(planItem);
        await _dbContext.SaveChangesAsync();

        return new GetNutritionPlanItemResponseDTO
        {
            Id = planItem.Id,
            MealTime = planItem.MealTime,
            FoodItemId = planItem.FoodItemId,
            FoodItemName = foodItem.Name,
            ServingCount = planItem.ServingCount,
            Notes = planItem.Notes
        };
    }

    public async Task<bool> DeleteNutritionPlan(Guid id)
    {
        var userId = _userContext.User.userId;
        var plan = await _dbContext.NutritionPlans.FindAsync(id)
            ?? throw new Exception("Nutrition plan not found");

        if (plan.OwnerUserId != userId)
            throw new UnauthorizedAccessException("You don't own this plan");

        _dbContext.NutritionPlans.Remove(plan);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    private GetNutritionPlanResponseDTO MapToResponseDTO(NutritionPlan plan)
    {
        return new GetNutritionPlanResponseDTO
        {
            Id = plan.Id,
            OwnerUserId = plan.OwnerUserId,
            Title = plan.Title,
            Description = plan.Description,
            CaloriesTargetKcal = plan.CaloriesTargetKcal,
            Macros = plan.Macros,
            StartDate = plan.StartDate,
            EndDate = plan.EndDate,
            Visibility = plan.Visibility,
            CreatedAt = plan.CreatedAt,
            Items = plan.Items?.Select(i => new GetNutritionPlanItemResponseDTO
            {
                Id = i.Id,
                MealTime = i.MealTime,
                FoodItemId = i.FoodItemId,
                FoodItemName = i.FoodItem?.Name ?? "",
                ServingCount = i.ServingCount,
                Notes = i.Notes
            }).ToList()
        };
    }
}
