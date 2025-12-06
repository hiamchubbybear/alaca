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

    public async Task<object> GetMyNutritionPlans(int page = 1, int pageSize = 20)
    {
        var skip = (page - 1) * pageSize;
        var userId = _userContext.User.userId;
        var query = _dbContext.NutritionPlans
            .Include(p => p.Items)
            .ThenInclude(i => i.FoodItem)
            .Where(p => p.OwnerUserId == userId);

        var total = await query.CountAsync();
        var plans = await query.Skip(skip).Take(pageSize).ToListAsync();
        return new { plans = plans.Select(p => MapToResponseDTO(p)), total, page, pageSize };
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
            ServingCount = (double)(planItem.ServingCount ?? 0m),
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
                ServingCount = (double)(i.ServingCount ?? 0m),
                Notes = i.Notes
            }).ToList()
        };
    }

    public async Task<GetNutritionPlanResponseDTO> UpdateNutritionPlan(Guid id, UpdateNutritionPlanRequestDTO dto)
    {
        var userId = _userContext.User.userId;
        var plan = await _dbContext.NutritionPlans.Include(p => p.Items).ThenInclude(i => i.FoodItem).FirstOrDefaultAsync(p => p.Id == id) ?? throw new Exception("Nutrition plan not found");
        if (plan.OwnerUserId != userId) throw new UnauthorizedAccessException("You don't own this plan");
        if (dto.Title != null) plan.Title = dto.Title;
        if (dto.Description != null) plan.Description = dto.Description;
        if (dto.CaloriesTargetKcal.HasValue) plan.CaloriesTargetKcal = dto.CaloriesTargetKcal;
        if (dto.Macros != null) plan.Macros = dto.Macros;
        if (dto.StartDate.HasValue) plan.StartDate = dto.StartDate;
        if (dto.EndDate.HasValue) plan.EndDate = dto.EndDate;
        if (dto.Visibility != null) plan.Visibility = dto.Visibility;
        plan.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();
        return MapToResponseDTO(plan);
    }

    public async Task<GetNutritionPlanItemResponseDTO> UpdatePlanItem(Guid planId, Guid itemId, UpdateNutritionPlanItemRequestDTO dto)
    {
        var userId = _userContext.User.userId;
        var plan = await _dbContext.NutritionPlans.FindAsync(planId) ?? throw new Exception("Plan not found");
        if (plan.OwnerUserId != userId) throw new UnauthorizedAccessException("You don't own this plan");
        var item = await _dbContext.NutritionPlanItems.Include(i => i.FoodItem).FirstOrDefaultAsync(i => i.Id == itemId && i.PlanId == planId) ?? throw new Exception("Item not found");
        if (dto.MealTime != null) item.MealTime = dto.MealTime;
        if (dto.ServingCount.HasValue) item.ServingCount = (decimal)dto.ServingCount.Value;
        if (dto.Notes != null) item.Notes = dto.Notes;
        await _dbContext.SaveChangesAsync();
        return new GetNutritionPlanItemResponseDTO { Id = item.Id, MealTime = item.MealTime, FoodItemId = item.FoodItemId, FoodItemName = item.FoodItem?.Name ?? "", ServingCount = (double)(item.ServingCount ?? 0m), Notes = item.Notes };
    }

    public async Task<bool> RemoveItemFromPlan(Guid planId, Guid itemId)
    {
        var userId = _userContext.User.userId;
        var plan = await _dbContext.NutritionPlans.FindAsync(planId) ?? throw new Exception("Plan not found");
        if (plan.OwnerUserId != userId) throw new UnauthorizedAccessException("You don't own this plan");
        var item = await _dbContext.NutritionPlanItems.FirstOrDefaultAsync(i => i.Id == itemId && i.PlanId == planId) ?? throw new Exception("Item not found");
        _dbContext.NutritionPlanItems.Remove(item);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<NutritionSummaryDTO> GetNutritionSummary(Guid id)
    {
        var userId = _userContext.User.userId;
        var plan = await _dbContext.NutritionPlans.Include(p => p.Items).ThenInclude(i => i.FoodItem).FirstOrDefaultAsync(p => p.Id == id) ?? throw new Exception("Plan not found");
        if (plan.OwnerUserId != userId && plan.Visibility == "private") throw new UnauthorizedAccessException("No access");
        var summary = new NutritionSummaryDTO { TotalCalories = 0, TotalProtein = 0, TotalCarbs = 0, TotalFat = 0, ItemCount = plan.Items?.Count ?? 0 };
        if (plan.Items != null)
        {
            foreach (var item in plan.Items)
            {
                if (item.FoodItem != null)
                {
                    summary.TotalCalories += (int)((item.FoodItem.CaloriesKcal ?? 0) * item.ServingCount);
                    summary.TotalProtein += (double)((item.FoodItem.ProteinG ?? 0) * item.ServingCount);
                    summary.TotalCarbs += (double)((item.FoodItem.CarbsG ?? 0) * item.ServingCount);
                    summary.TotalFat += (double)((item.FoodItem.FatG ?? 0) * item.ServingCount);
                }
            }
        }
        return summary;
    }
}
