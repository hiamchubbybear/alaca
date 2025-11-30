using fitlife_planner_back_end.Api.Controllers;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;

namespace fitlife_planner_back_end.Tests.Controllers;

public class FoodItemControllerTests
{
    private readonly Mock<FoodItemService> _mockService;
    private readonly Mock<ILogger<FoodItemController>> _mockLogger;
    private readonly FoodItemController _controller;

    public FoodItemControllerTests()
    {
        _mockService = new Mock<FoodItemService>(null, null, null);
        _mockLogger = new Mock<ILogger<FoodItemController>>();
        _controller = new FoodItemController(_mockService.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetAllFoodItems_ReturnsSuccessResponse()
    {
        // Arrange
        var foodItems = new List<GetFoodItemResponseDTO>
        {
            new GetFoodItemResponseDTO
            {
                Id = Guid.NewGuid(),
                Name = "Chicken Breast",
                CaloriesKcal = 165,
                ProteinG = 31
            }
        };
        _mockService.Setup(s => s.GetAllFoodItems())
            .ReturnsAsync(foodItems);

        // Act
        var result = await _controller.GetAllFoodItems();

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        var data = result.Data as List<GetFoodItemResponseDTO>;
        data.Should().NotBeNull();
        data.Should().HaveCount(1);
        data!.First().Name.Should().Be("Chicken Breast");
    }

    [Fact]
    public async Task GetFoodItemById_WithValidId_ReturnsFood()
    {
        // Arrange
        var foodId = Guid.NewGuid();
        var foodItem = new GetFoodItemResponseDTO
        {
            Id = foodId,
            Name = "Banana",
            CaloriesKcal = 105
        };
        _mockService.Setup(s => s.GetFoodItemById(foodId))
            .ReturnsAsync(foodItem);

        // Act
        var result = await _controller.GetFoodItemById(foodId);

        // Assert
        result.Success.Should().BeTrue();
        var data = result.Data as GetFoodItemResponseDTO;
        data.Should().NotBeNull();
        data!.Name.Should().Be("Banana");
    }

    [Fact]
    public async Task CreateFoodItem_WithValidData_ReturnsCreatedFood()
    {
        // Arrange
        var createDto = new CreateFoodItemRequestDTO
        {
            Name = "Oatmeal",
            CaloriesKcal = 150,
            ProteinG = 5
        };
        var createdFood = new GetFoodItemResponseDTO
        {
            Id = Guid.NewGuid(),
            Name = "Oatmeal",
            CaloriesKcal = 150
        };
        _mockService.Setup(s => s.CreateFoodItem(It.IsAny<CreateFoodItemRequestDTO>()))
            .ReturnsAsync(createdFood);

        // Act
        var result = await _controller.CreateFoodItem(createDto);

        // Assert
        result.Success.Should().BeTrue();
        result.StatusCode.Should().Be(System.Net.HttpStatusCode.Created);
        var data = result.Data as GetFoodItemResponseDTO;
        data.Should().NotBeNull();
        data!.Name.Should().Be("Oatmeal");
    }
}
