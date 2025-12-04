using System.Text.Json;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.SeedData;
using fitlife_planner_back_end.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Services;

public class DataSeederService
{
    private readonly AppDbContext _db;
    private readonly ILogger<DataSeederService> _logger;
    private readonly IWebHostEnvironment _env;

    public DataSeederService(
        AppDbContext db,
        ILogger<DataSeederService> logger,
        IWebHostEnvironment env)
    {
        _db = db;
        _logger = logger;
        _env = env;
    }

    public async Task SeedAllDataAsync()
    {
        try
        {
            await SeedNutritionDataAsync();
            await SeedExerciseDataAsync();
            _logger.LogInformation("✓ All data seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during data seeding");
            throw;
        }
    }

    private async Task SeedNutritionDataAsync()
    {
        try
        {
            // Check if data already exists
            var existingCount = await _db.FoodItems.CountAsync();
            if (existingCount > 0)
            {
                _logger.LogInformation($"Nutrition data already seeded ({existingCount} items). Skipping...");
                return;
            }

            // Load JSON file
            var jsonPath = Path.Combine(_env.ContentRootPath, "data", "nutrition_data.json");
            if (!File.Exists(jsonPath))
            {
                _logger.LogWarning($"Nutrition data file not found at: {jsonPath}");
                return;
            }

            var jsonData = await File.ReadAllTextAsync(jsonPath);
            var nutritionData = JsonSerializer.Deserialize<NutritionDataRoot>(jsonData);

            if (nutritionData?.Data == null || !nutritionData.Data.Any())
            {
                _logger.LogWarning("No nutrition data found in JSON file");
                return;
            }

            // Transform and insert
            var foodItems = new List<FoodItem>();
            foreach (var item in nutritionData.Data)
            {
                // Skip items with missing critical data
                if (item.Nutrition == null || item.Nutrition.Energy == 0)
                    continue;

                var foodItem = new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = item.File.Replace(".pdf", "").Trim(),
                    CaloriesKcal = (int)Math.Round(item.Nutrition.Energy),
                    ProteinG = (decimal)item.Nutrition.Protein,
                    CarbsG = (decimal)item.Nutrition.Carb,
                    FatG = (decimal)item.Nutrition.Fat,
                    ServingSize = "100g",
                    ServingAmount = 1,
                    FiberG = 0,
                    SodiumMg = 0,
                    Micronutrients = "{}",
                    CreatedAt = DateTime.UtcNow
                };
                foodItems.Add(foodItem);
            }

            await _db.FoodItems.AddRangeAsync(foodItems);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"✓ Seeded {foodItems.Count} food items from nutrition_data.json");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding nutrition data");
            throw;
        }
    }

    private async Task SeedExerciseDataAsync()
    {
        try
        {
            // Check if data already exists
            var existingCount = await _db.ExerciseLibrary.CountAsync();
            if (existingCount > 0)
            {
                _logger.LogInformation($"Exercise data already seeded ({existingCount} items). Skipping...");
                return;
            }

            // Load JSON file
            var jsonPath = Path.Combine(_env.ContentRootPath, "data", "exercise_data.json");
            if (!File.Exists(jsonPath))
            {
                _logger.LogWarning($"Exercise data file not found at: {jsonPath}");
                return;
            }

            var jsonData = await File.ReadAllTextAsync(jsonPath);
            var exerciseData = JsonSerializer.Deserialize<ExerciseDataRoot>(jsonData);

            if (exerciseData?.Exercises == null || !exerciseData.Exercises.Any())
            {
                _logger.LogWarning("No exercise data found in JSON file");
                return;
            }

            // Transform and insert
            var exercises = new List<ExerciseLibrary>();
            var systemUserId = Guid.Empty; // System-created exercises

            foreach (var ex in exerciseData.Exercises)
            {
                var exercise = new ExerciseLibrary
                {
                    Id = Guid.NewGuid(),
                    Title = ex.Title,
                    Description = ex.Description,
                    PrimaryMuscle = ex.PrimaryMuscle,
                    SecondaryMuscles = ex.SecondaryMuscles != null && ex.SecondaryMuscles.Any()
                        ? string.Join(",", ex.SecondaryMuscles)
                        : "",
                    Equipment = ex.Equipment != null && ex.Equipment.Any()
                        ? string.Join(",", ex.Equipment)
                        : "",
                    Difficulty = ex.Difficulty,
                    VideoUrl = ex.VideoUrl,
                    Images = ex.Images != null && ex.Images.Any()
                        ? JsonSerializer.Serialize(ex.Images)
                        : "[]",
                    CreatedBy = systemUserId,
                    CreatedAt = DateTime.UtcNow
                };
                exercises.Add(exercise);
            }

            await _db.ExerciseLibrary.AddRangeAsync(exercises);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"✓ Seeded {exercises.Count} exercises from exercise_data.json");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding exercise data");
            throw;
        }
    }
}
