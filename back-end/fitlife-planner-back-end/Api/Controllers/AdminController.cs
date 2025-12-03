using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using fitlife_planner_back_end.Api.Extensions;


namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly ILogger<AdminController> _logger;
    private readonly NutritionDataSeeder _nutritionDataSeeder;
    private readonly IWebHostEnvironment _environment;

    public AdminController(
        ILogger<AdminController> logger,
        NutritionDataSeeder nutritionDataSeeder,
        IWebHostEnvironment environment)
    {
        _logger = logger;
        _nutritionDataSeeder = nutritionDataSeeder;
        _environment = environment;
    }

    /// <summary>
    /// Seed nutrition data from JSON file (Admin only)
    /// </summary>
    [HttpPost("seed/nutrition-data")]
    public async Task<IActionResult> SeedNutritionData()
    {
        try
        {
            var jsonFilePath = Path.Combine(_environment.ContentRootPath, "data", "nutrition_data.json");

            var count = await _nutritionDataSeeder.SeedFromJsonFile(jsonFilePath);

            var response = new ApiResponse<object>(
                success: true,
                message: $"Successfully seeded {count} food items",
                data: new { itemsSeeded = count },
                statusCode: HttpStatusCode.OK
            );;


            return response.ToActionResult();
        }
        catch (FileNotFoundException ex)
        {
            _logger.LogError(ex, "Nutrition data file not found");
            var response = new ApiResponse<object>(
                success: false,
                message: "Nutrition data file not found",
                statusCode: HttpStatusCode.NotFound
            );;

            return response.ToActionResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding nutrition data");
            var response = new ApiResponse<object>(
                success: false,
                message: "Failed to seed nutrition data",
                statusCode: HttpStatusCode.InternalServerError
            );;

            return response.ToActionResult();
        }
    }
}
