using fitlife_planner_back_end.Api.Controllers;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace fitlife_planner_back_end.Tests.Controllers;

public class ProgressControllerTests
{
    private readonly Mock<ProgressService> _mockService;
    private readonly Mock<ILogger<ProgressController>> _mockLogger;
    private readonly ProgressController _controller;

    public ProgressControllerTests()
    {
        _mockService = new Mock<ProgressService>(null, null, null);
        _mockLogger = new Mock<ILogger<ProgressController>>();
        _controller = new ProgressController(_mockService.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetMyProgress_ReturnsProgressList()
    {
        // Arrange
        var progressEntries = new List<GetProgressEntryResponseDTO>
        {
            new GetProgressEntryResponseDTO
            {
                Id = Guid.NewGuid(),
                Type = "weight",
                NumericValue = 75.5m,
                RecordedAt = DateTime.UtcNow
            }
        };
        _mockService.Setup(s => s.GetMyProgress(null))
            .ReturnsAsync(progressEntries);

        // Act
        var result = await _controller.GetMyProgress(null);

        // Assert
        result.Success.Should().BeTrue();
        var data = result.Data as List<GetProgressEntryResponseDTO>;
        data.Should().NotBeNull();
        data.Should().HaveCount(1);
        data!.First().Type.Should().Be("weight");
    }

    [Fact]
    public async Task GetMyProgress_WithTypeFilter_ReturnsFilteredList()
    {
        // Arrange
        var progressEntries = new List<GetProgressEntryResponseDTO>
        {
            new GetProgressEntryResponseDTO
            {
                Id = Guid.NewGuid(),
                Type = "weight",
                NumericValue = 75.5m
            }
        };
        _mockService.Setup(s => s.GetMyProgress("weight"))
            .ReturnsAsync(progressEntries);

        // Act
        var result = await _controller.GetMyProgress("weight");

        // Assert
        result.Success.Should().BeTrue();
        var data = result.Data as List<GetProgressEntryResponseDTO>;
        data.Should().NotBeNull();
        data.Should().HaveCount(1);
        data!.All(p => p.Type == "weight").Should().BeTrue();
    }

    [Fact]
    public async Task CreateProgressEntry_WithValidData_ReturnsCreatedEntry()
    {
        // Arrange
        var createDto = new CreateProgressEntryRequestDTO
        {
            Type = "weight",
            NumericValue = 76.0m
        };
        var createdEntry = new GetProgressEntryResponseDTO
        {
            Id = Guid.NewGuid(),
            Type = "weight",
            NumericValue = 76.0m
        };
        _mockService.Setup(s => s.CreateProgressEntry(It.IsAny<CreateProgressEntryRequestDTO>()))
            .ReturnsAsync(createdEntry);

        // Act
        var result = await _controller.CreateProgressEntry(createDto);

        // Assert
        result.Success.Should().BeTrue();
        result.StatusCode.Should().Be(System.Net.HttpStatusCode.Created);
    }
}
