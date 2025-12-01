using System.Text.Json;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Services;

public class NutritionDataSeeder
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<NutritionDataSeeder> _logger;

    public NutritionDataSeeder(AppDbContext dbContext, ILogger<NutritionDataSeeder> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<int> SeedFromJsonFile(string jsonFilePath)
    {
        try
        {
            if (!File.Exists(jsonFilePath))
            {
                throw new FileNotFoundException($"Nutrition data file not found: {jsonFilePath}");
            }

            var jsonContent = await File.ReadAllTextAsync(jsonFilePath);
            var nutritionData = JsonSerializer.Deserialize<NutritionDataRoot>(jsonContent);

            if (nutritionData?.Data == null || nutritionData.Data.Count == 0)
            {
                _logger.LogWarning("No nutrition data found in JSON file");
                return 0;
            }

            var foodItems = new List<FoodItem>();
            var processedCount = 0;
            var skippedCount = 0;

            foreach (var item in nutritionData.Data)
            {
                // Skip items with missing critical data
                if (item.Nutrition == null ||
                    item.Nutrition.Energy == 0 ||
                    string.IsNullOrWhiteSpace(item.File))
                {
                    skippedCount++;
                    continue;
                }

                // Extract food name from filename (remove .pdf extension)
                var foodName = item.File.Replace(".pdf", "").Trim();

                // Check if food item already exists
                var existingItem = await _dbContext.FoodItems
                    .FirstOrDefaultAsync(f => f.Name == foodName);

                if (existingItem != null)
                {
                    _logger.LogInformation("Food item '{FoodName}' already exists, skipping", foodName);
                    skippedCount++;
                    continue;
                }

                var foodItem = new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = foodName,
                    ServingSize = "100g", // Default serving size
                    ServingAmount = 1,
                    CaloriesKcal = (int)Math.Round(item.Nutrition.Energy),
                    ProteinG = (decimal)item.Nutrition.Protein,
                    CarbsG = (decimal)item.Nutrition.Carb,
                    FatG = (decimal)item.Nutrition.Fat,
                    FiberG = 0, // Not provided in source data
                    SodiumMg = 0, // Not provided in source data
                    Micronutrients = "{}", // Empty JSON object
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                foodItems.Add(foodItem);
                processedCount++;
            }

            if (foodItems.Any())
            {
                await _dbContext.FoodItems.AddRangeAsync(foodItems);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation(
                    "Successfully seeded {ProcessedCount} food items. Skipped {SkippedCount} items.",
                    processedCount, skippedCount);
            }

            return processedCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding nutrition data from JSON file");
            throw;
        }
    }
}

// JSON deserialization models
public class NutritionDataRoot
{
    public NutritionStats? Stats { get; set; }
    public List<NutritionDataItem> Data { get; set; } = new();
}

public class NutritionStats
{
    public int Total { get; set; }
    public int Valid { get; set; }
    public int Invalid { get; set; }
}

public class NutritionDataItem
{
    public string File { get; set; } = string.Empty;
    public NutritionInfo? Nutrition { get; set; }
}

public class NutritionInfo
{
    public double Energy { get; set; }
    public double Protein { get; set; }
    public double Fat { get; set; }
    public double Carb { get; set; }
}
