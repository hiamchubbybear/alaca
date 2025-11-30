using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace fitlife_planner_back_end.Tests.Services;

public class FoodItemServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly Mock<ILogger<FoodItemService>> _mockLogger;
    private readonly Mock<IUserContext> _mockUserContext;
    private readonly FoodItemService _service;

    public FoodItemServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new AppDbContext(options);

        _mockLogger = new Mock<ILogger<FoodItemService>>();
        _mockUserContext = new Mock<IUserContext>();

        _service = new FoodItemService(_context, _mockLogger.Object, _mockUserContext.Object);
    }

    [Fact]
    public async Task GetAllFoodItems_ReturnsAllItems()
    {
        // Arrange
        _context.FoodItems.AddRange(
            new FoodItem { Name = "Chicken", CaloriesKcal = 165 },
            new FoodItem { Name = "Rice", CaloriesKcal = 130 }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetAllFoodItems();

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(f => f.Name == "Chicken");
        result.Should().Contain(f => f.Name == "Rice");
    }

    [Fact]
    public async Task GetFoodItemById_WithValidId_ReturnsItem()
    {
        // Arrange
        var foodItem = new FoodItem { Name = "Banana", CaloriesKcal = 105 };
        _context.FoodItems.Add(foodItem);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetFoodItemById(foodItem.Id);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Banana");
        result.CaloriesKcal.Should().Be(105);
    }

    [Fact]
    public async Task GetFoodItemById_WithInvalidId_ThrowsException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() =>
            _service.GetFoodItemById(Guid.NewGuid()));
    }

    [Fact]
    public async Task CreateFoodItem_WithValidData_CreatesItem()
    {
        // Arrange
        var createDto = new CreateFoodItemRequestDTO
        {
            Name = "Oatmeal",
            CaloriesKcal = 150,
            ProteinG = 5,
            CarbsG = 27
        };

        // Act
        var result = await _service.CreateFoodItem(createDto);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Oatmeal");

        var savedItem = await _context.FoodItems.FindAsync(result.Id);
        savedItem.Should().NotBeNull();
        savedItem!.Name.Should().Be("Oatmeal");
    }

    [Fact]
    public async Task DeleteFoodItem_WithValidId_DeletesItem()
    {
        // Arrange
        var foodItem = new FoodItem { Name = "ToDelete", CaloriesKcal = 100 };
        _context.FoodItems.Add(foodItem);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.DeleteFoodItem(foodItem.Id);

        // Assert
        result.Should().BeTrue();
        var deletedItem = await _context.FoodItems.FindAsync(foodItem.Id);
        deletedItem.Should().BeNull();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
