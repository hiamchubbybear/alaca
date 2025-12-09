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
            await SeedWorkoutDataAsync();
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
                    Instructions = ex.Instructions != null && ex.Instructions.Any()
                        ? JsonSerializer.Serialize(ex.Instructions)
                        : "[]",
                    Tags = ex.Tags != null && ex.Tags.Any()
                        ? string.Join(",", ex.Tags)
                        : "",
                    CaloriesBurnedPerSet = ex.CaloriesBurnedPerSet,
                    RecommendedSets = ex.RecommendedSets,
                    RecommendedReps = ex.RecommendedReps,
                    RestSeconds = ex.RestSeconds,
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

    private async Task SeedWorkoutDataAsync()
    {
        try
        {
            // Check if data already exists
            var existingCount = await _db.Workouts.CountAsync();
            if (existingCount > 0)
            {
                _logger.LogInformation($"Workout data already seeded ({existingCount} items). Skipping...");
                return;
            }

            // Load JSON file
            var jsonPath = Path.Combine(_env.ContentRootPath, "data", "workout_data.json");
            if (!File.Exists(jsonPath))
            {
                _logger.LogWarning($"Workout data file not found at: {jsonPath}");
                return;
            }

            var jsonData = await File.ReadAllTextAsync(jsonPath);
            var workoutData = JsonSerializer.Deserialize<WorkoutDataRoot>(jsonData);

            if (workoutData?.Workouts == null || !workoutData.Workouts.Any())
            {
                _logger.LogWarning("No workout data found in JSON file");
                return;
            }

            var systemUserId = Guid.Empty; // System-created workouts

            foreach (var workoutDto in workoutData.Workouts)
            {
                // Create workout
                var workout = new Workout
                {
                    Id = Guid.NewGuid(),
                    OwnerUserId = systemUserId,
                    Title = workoutDto.Title,
                    Description = workoutDto.Description,
                    Intensity = workoutDto.Intensity,
                    DurationMin = workoutDto.EstimatedDuration,
                    VideoUrl = workoutDto.VideoUrl,
                    CreatedAt = DateTime.UtcNow
                };

                await _db.Workouts.AddAsync(workout);

                // Add exercises to workout
                foreach (var exerciseDto in workoutDto.Exercises)
                {
                    // Find exercise by title
                    var exercise = await _db.ExerciseLibrary
                        .FirstOrDefaultAsync(e => e.Title == exerciseDto.ExerciseTitle);

                    if (exercise != null)
                    {
                        var workoutExercise = new WorkoutExercise
                        {
                            Id = Guid.NewGuid(),
                            WorkoutId = workout.Id,
                            ExerciseId = exercise.Id,
                            Sets = exerciseDto.Sets,
                            Reps = exerciseDto.Reps,
                            RestSeconds = exerciseDto.RestSeconds,
                            OrderIndex = exerciseDto.OrderIndex
                        };

                        await _db.WorkoutExercises.AddAsync(workoutExercise);
                    }
                }
            }

            await _db.SaveChangesAsync();
            _logger.LogInformation($"✓ Seeded {workoutData.Workouts.Count} workouts from workout_data.json");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding workout data");
            throw;
        }
    }
}

// JSON deserialization models
public class NutritionDataRoot
{
    [System.Text.Json.Serialization.JsonPropertyName("stats")]
    public NutritionStats? Stats { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("data")]
    public List<NutritionDataItem> Data { get; set; } = new();
}

public class NutritionStats
{
    [System.Text.Json.Serialization.JsonPropertyName("total")]
    public int Total { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("valid")]
    public int Valid { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("invalid")]
    public int Invalid { get; set; }
}

public class NutritionDataItem
{
    [System.Text.Json.Serialization.JsonPropertyName("file")]
    public string File { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("nutrition")]
    public NutritionInfo? Nutrition { get; set; }
}

public class NutritionInfo
{
    [System.Text.Json.Serialization.JsonPropertyName("energy")]
    public double Energy { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("protein")]
    public double Protein { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("fat")]
    public double Fat { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("carb")]
    public double Carb { get; set; }
}

// Exercise data models
public class ExerciseDataRoot
{
    [System.Text.Json.Serialization.JsonPropertyName("exercises")]
    public List<ExerciseDataItem> Exercises { get; set; } = new();
}

public class ExerciseDataItem
{
    [System.Text.Json.Serialization.JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("primaryMuscle")]
    public string PrimaryMuscle { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("secondaryMuscles")]
    public List<string>? SecondaryMuscles { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("equipment")]
    public List<string>? Equipment { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("difficulty")]
    public string Difficulty { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("instructions")]
    public List<string>? Instructions { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("tags")]
    public List<string>? Tags { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("caloriesBurnedPerSet")]
    public int CaloriesBurnedPerSet { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("recommendedSets")]
    public string RecommendedSets { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("recommendedReps")]
    public string RecommendedReps { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("restSeconds")]
    public int RestSeconds { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("videoUrl")]
    public string VideoUrl { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("images")]
    public List<string>? Images { get; set; }
}

// Workout data models
public class WorkoutDataRoot
{
    [System.Text.Json.Serialization.JsonPropertyName("workouts")]
    public List<WorkoutDataItem> Workouts { get; set; } = new();
}

public class WorkoutDataItem
{
    [System.Text.Json.Serialization.JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("intensity")]
    public string Intensity { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("estimatedDuration")]
    public int EstimatedDuration { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("videoUrl")]
    public string VideoUrl { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("exercises")]
    public List<WorkoutExerciseDataItem> Exercises { get; set; } = new();
}

public class WorkoutExerciseDataItem
{
    [System.Text.Json.Serialization.JsonPropertyName("exerciseTitle")]
    public string ExerciseTitle { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("sets")]
    public int Sets { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("reps")]
    public string Reps { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("restSeconds")]
    public int RestSeconds { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("orderIndex")]
    public int OrderIndex { get; set; }
}
