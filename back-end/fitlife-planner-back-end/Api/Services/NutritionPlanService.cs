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

    // Vietnam timezone (UTC+7)
    private static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

    public NutritionPlanService(AppDbContext dbContext, ILogger<NutritionPlanService> logger, IUserContext userContext)
    {
        _dbContext = dbContext;
        _logger = logger;
        _userContext = userContext;
    }

    // Convert UTC to Vietnam time
    private DateTime ToVietnamTime(DateTime utcTime)
    {
        return TimeZoneInfo.ConvertTimeFromUtc(utcTime, VietnamTimeZone);
    }

    // Get current Vietnam date (for comparing dates)
    private DateTime GetVietnamToday()
    {
        return ToVietnamTime(DateTime.UtcNow).Date;
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

        // Load plan with existing items to calculate total calories
        var plan = await _dbContext.NutritionPlans
            .Include(p => p.Items)
            .ThenInclude(i => i.FoodItem)
            .FirstOrDefaultAsync(p => p.Id == planId)
            ?? throw new Exception("Nutrition plan not found");

        if (plan.OwnerUserId != userId)
            throw new UnauthorizedAccessException("You don't own this plan");

        var foodItem = await _dbContext.FoodItems.FindAsync(dto.FoodItemId)
            ?? throw new Exception("Food item not found");

        // Check against limit (if set)
        if (plan.CaloriesTargetKcal.HasValue)
        {
            var targetDate = dto.Date?.Date ?? GetVietnamToday();

            // Calculate current total calories *FOR THIS DATE*
            var currentDailyCalories = plan.Items
                .Where(i => i.Date.HasValue && i.Date.Value.Date == targetDate)
                .Sum(i => (i.FoodItem?.CaloriesKcal ?? 0) * (double)(i.ServingCount ?? 0));

            var newItemCalories = (foodItem.CaloriesKcal ?? 0) * (double)(dto.ServingCount ?? 0);

            if (currentDailyCalories + newItemCalories > plan.CaloriesTargetKcal.Value)
            {
                throw new InvalidOperationException($"Adding this item would exceed the daily calorie limit of {plan.CaloriesTargetKcal.Value} kcal for {targetDate:d}. Current: {currentDailyCalories}, New: {newItemCalories}");
            }
        }

        // Debug logging
        _logger.LogInformation($"🔍 Backend received date: {dto.Date}");
        _logger.LogInformation($"🔍 Date after .Date: {dto.Date?.Date}");

        var planItem = new NutritionPlanItem
        {
            PlanId = planId,
            MealTime = dto.MealTime,
            FoodItemId = dto.FoodItemId,
            ServingCount = dto.ServingCount,
            Notes = dto.Notes,
            Date = dto.Date?.Date  // Only store date part, no time
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
                FoodItem = i.FoodItem,
                ServingCount = (double)(i.ServingCount ?? 0m),
                Notes = i.Notes,
                Date = i.Date?.ToString("yyyy-MM-dd"),
                IsCompleted = i.IsCompleted
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

        // Load plan with items to validate calories
        var plan = await _dbContext.NutritionPlans
            .Include(p => p.Items)
            .ThenInclude(i => i.FoodItem)
            .FirstOrDefaultAsync(p => p.Id == planId)
            ?? throw new Exception("Plan not found");

        if (plan.OwnerUserId != userId) throw new UnauthorizedAccessException("You don't own this plan");

        var item = plan.Items.FirstOrDefault(i => i.Id == itemId)
            ?? throw new Exception("Item not found"); // Item is already loaded via Include

        // Update properties provisionally or calculate new values
        var newServingCount = dto.ServingCount.HasValue ? (decimal)dto.ServingCount.Value : (item.ServingCount ?? 0);

        // Calculate new total
        // Sum of all OTHER items ON THE SAME DATE + (This Item's Cals * New Serving Count)
        if (plan.CaloriesTargetKcal.HasValue)
        {
             var targetDate = item.Date?.Date ?? GetVietnamToday();

             var otherItemsCalories = plan.Items
                .Where(i => i.Id != itemId && i.Date.HasValue && i.Date.Value.Date == targetDate)
                .Sum(i => (i.FoodItem?.CaloriesKcal ?? 0) * (double)(i.ServingCount ?? 0));

            var thisItemCalories = (item.FoodItem?.CaloriesKcal ?? 0) * (double)newServingCount;

            if (otherItemsCalories + thisItemCalories > plan.CaloriesTargetKcal.Value)
            {
                 throw new InvalidOperationException($"Updating this item would exceed the daily calorie limit of {plan.CaloriesTargetKcal.Value} kcal for {targetDate:d}.");
            }
        }

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

    /// <summary>
    /// Auto-generates a balanced meal plan for a specific date
    /// Ensures meals meet calorie target without exceeding it
    /// </summary>
    public async Task<GetNutritionPlanResponseDTO> GenerateDailyMealPlan(Guid planId, DateTime date, int? caloriesTargetOverride = null)
    {
        var userId = _userContext.User.userId;

        // Load plan with existing items
        var plan = await _dbContext.NutritionPlans
            .Include(p => p.Items)
            .ThenInclude(i => i.FoodItem)
            .FirstOrDefaultAsync(p => p.Id == planId)
            ?? throw new Exception("Nutrition plan not found");

        if (plan.OwnerUserId != userId)
            throw new UnauthorizedAccessException("You don't own this plan");

        var targetCalories = caloriesTargetOverride ?? plan.CaloriesTargetKcal ?? 2000;
        var targetDate = date.Date;

        // Debug logging
        _logger.LogInformation($"🔍 Generate: Received date parameter: {date}");
        _logger.LogInformation($"🔍 Generate: Target date after .Date: {targetDate}");

        // Remove any existing items for this date
        var existingItems = plan.Items.Where(i => i.Date.HasValue && i.Date.Value.Date == targetDate).ToList();
        _dbContext.NutritionPlanItems.RemoveRange(existingItems);

        // Get all available food items
        var allFoods = await _dbContext.FoodItems.ToListAsync();
        if (!allFoods.Any())
            throw new Exception("No food items available in database");

        // Meal distribution: Breakfast 30%, Lunch 35%, Dinner 30%, Snack 5%
        var mealDistribution = new Dictionary<string, double>
        {
            { "Breakfast", 0.30 },
            { "Lunch", 0.35 },
            { "Dinner", 0.30 },
            { "Snack", 0.05 }
        };

        var generatedItems = new List<NutritionPlanItem>();
        var random = new Random();

        foreach (var meal in mealDistribution)
        {
            var mealCalorieTarget = targetCalories * meal.Value;
            var currentMealCalories = 0.0;
            var attempts = 0;
            var maxAttempts = 50;

            // Try to build a meal that gets close to target
            while (currentMealCalories < mealCalorieTarget * 0.8 && attempts < maxAttempts)
            {
                attempts++;

                // Select random food item
                var food = allFoods[random.Next(allFoods.Count)];
                var foodCalories = food.CaloriesKcal ?? 0;

                if (foodCalories == 0) continue;

                // Calculate serving to not exceed remaining calories
                var remainingCalories = mealCalorieTarget - currentMealCalories;
                var maxServings = Math.Floor(remainingCalories / foodCalories);

                if (maxServings < 0.5) continue; // Skip if can't fit even half serving

                var servings = Math.Min(maxServings, random.Next(1, 3)); // 1-2 servings typically

                var itemCalories = foodCalories * servings;

                // Don't add if it would exceed meal target by too much
                if (currentMealCalories + itemCalories > mealCalorieTarget * 1.1)
                    continue;

                var planItem = new NutritionPlanItem
                {
                    PlanId = planId,
                    MealTime = meal.Key,
                    FoodItemId = food.Id,
                    ServingCount = (decimal)servings,
                    Date = targetDate,
                    IsCompleted = false
                };

                generatedItems.Add(planItem);
                currentMealCalories += itemCalories;

                // If we're close enough to target, stop
                if (currentMealCalories >= mealCalorieTarget * 0.9)
                    break;
            }
        }

        // Add all generated items
        await _dbContext.NutritionPlanItems.AddRangeAsync(generatedItems);
        await _dbContext.SaveChangesAsync();

        // Reload plan with new items
        var updatedPlan = await _dbContext.NutritionPlans
            .Include(p => p.Items)
            .ThenInclude(i => i.FoodItem)
            .FirstOrDefaultAsync(p => p.Id == planId);

        return MapToResponseDTO(updatedPlan!);
    }

    /// <summary>
    /// Mark a meal item as completed/uncompleted
    /// </summary>
    public async Task<GetNutritionPlanItemResponseDTO> MarkMealItemCompleted(Guid planId, Guid itemId, bool isCompleted)
    {
        var userId = _userContext.User.userId;

        var plan = await _dbContext.NutritionPlans.FindAsync(planId)
            ?? throw new Exception("Plan not found");

        if (plan.OwnerUserId != userId)
            throw new UnauthorizedAccessException("You don't own this plan");

        var item = await _dbContext.NutritionPlanItems
            .Include(i => i.FoodItem)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.PlanId == planId)
            ?? throw new Exception("Item not found");

        item.IsCompleted = isCompleted;
        await _dbContext.SaveChangesAsync();

        return new GetNutritionPlanItemResponseDTO
        {
            Id = item.Id,
            MealTime = item.MealTime,
            FoodItemId = item.FoodItemId,
            FoodItemName = item.FoodItem?.Name ?? "",
            ServingCount = (double)(item.ServingCount ?? 0m),
            Notes = item.Notes,
            Date = item.Date?.ToString("yyyy-MM-dd"),
            IsCompleted = item.IsCompleted
        };
    }

    // Get calories target from latest BMI record
    // TODO: Implement proper calorie calculation from BMI record
    private async Task<int?> GetCaloriesTargetFromBMI()
    {
        // For now, return a default value
        // In the future, calculate based on BMI, activity level, and goals
        await Task.CompletedTask;
        return 2000; // Default calories target
        /*
        var userId = _userContext.User.userId;

        var latestBMI = await _dbContext.BmiRecords
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.RecordDate)
            .FirstOrDefaultAsync();

        if (latestBMI == null || !latestBMI.CalorieTarget.HasValue)
            return null;

        return (int)latestBMI.CalorieTarget.Value;
        */
    }

    // Create weekly nutrition plan (Monday to Sunday)
    public async Task<GetNutritionPlanResponseDTO> CreateWeeklyNutritionPlan(DateTime anyDateInWeek)
    {
        var userId = _userContext.User.userId;

        // Get calories target from BMI
        var caloriesTarget = await GetCaloriesTargetFromBMI();
        if (!caloriesTarget.HasValue)
        {
            throw new Exception("Bạn cần cập nhật thông số sức khỏe (BMI Record) để sử dụng tính năng này. Vui lòng thiết lập mục tiêu calories trong hồ sơ sức khỏe.");
        }

        // Find Monday of the week
        var dayOfWeek = (int)anyDateInWeek.DayOfWeek;
        var daysToMonday = dayOfWeek == 0 ? -6 : 1 - dayOfWeek;
        var monday = anyDateInWeek.AddDays(daysToMonday).Date;
        var sunday = monday.AddDays(6);

        // Check if plan already exists for this week
        var existingPlan = await _dbContext.NutritionPlans
            .Include(p => p.Items)
            .ThenInclude(i => i.FoodItem)
            .FirstOrDefaultAsync(p =>
                p.OwnerUserId == userId &&
                p.StartDate == monday &&
                p.EndDate == sunday);

        if (existingPlan != null)
        {
            return MapToResponseDTO(existingPlan);
        }

        // Create new weekly plan
        var plan = new NutritionPlan
        {
            OwnerUserId = userId,
            Title = $"Weekly Plan {monday:MMM dd} - {sunday:MMM dd}",
            Description = "Kế hoạch dinh dưỡng hàng tuần",
            CaloriesTargetKcal = caloriesTarget.Value,
            StartDate = monday,
            EndDate = sunday,
            Visibility = "private"
        };

        await _dbContext.NutritionPlans.AddAsync(plan);
        await _dbContext.SaveChangesAsync();

        return MapToResponseDTO(plan);
    }

    // Update nutrition plan item (replace food item)
    public async Task<GetNutritionPlanItemResponseDTO> UpdateNutritionPlanItem(
        Guid planId,
        Guid itemId,
        UpdateNutritionPlanItemRequestDTO dto)
    {
        var userId = _userContext.User.userId;

        var plan = await _dbContext.NutritionPlans
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == planId)
            ?? throw new Exception("Nutrition plan not found");

        if (plan.OwnerUserId != userId)
            throw new UnauthorizedAccessException("You don't own this plan");

        var item = await _dbContext.NutritionPlanItems
            .Include(i => i.FoodItem)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.PlanId == planId)
            ?? throw new Exception("Item not found");

        // Check if date is in the past
        if (item.Date.HasValue && item.Date.Value.Date < GetVietnamToday())
        {
            throw new Exception("Không thể cập nhật món ăn của ngày đã qua");
        }

        // Update food item
        var newFoodItem = await _dbContext.FoodItems.FindAsync(dto.NewFoodItemId)
            ?? throw new Exception("Food item not found");

        item.FoodItemId = dto.NewFoodItemId;
        item.FoodItem = newFoodItem;

        if (dto.ServingCount.HasValue)
            item.ServingCount = (decimal)dto.ServingCount.Value;

        if (dto.Notes != null)
            item.Notes = dto.Notes;

        await _dbContext.SaveChangesAsync();

        return new GetNutritionPlanItemResponseDTO
        {
            Id = item.Id,
            MealTime = item.MealTime,
            FoodItemId = item.FoodItemId,
            FoodItemName = item.FoodItem?.Name ?? "",
            ServingCount = (double)(item.ServingCount ?? 0m),
            Notes = item.Notes,
            Date = item.Date?.ToString("yyyy-MM-dd"),
            IsCompleted = item.IsCompleted
        };
    }
}
