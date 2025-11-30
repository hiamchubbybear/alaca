using fitlife_planner_back_end.Api.Controllers;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace fitlife_planner_back_end.Tests.Controllers;

public class WorkoutControllerTests
{
    private readonly Mock<WorkoutService> _mockService;
    private readonly Mock<ILogger<WorkoutController>> _mockLogger;
    private readonly WorkoutController _controller;

    public WorkoutControllerTests()
    {
        _mockService = new Mock<WorkoutService>(null, null, null);
        _mockLogger = new Mock<ILogger<WorkoutController>>();
        _controller = new WorkoutController(_mockService.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetMyWorkouts_ReturnsWorkoutList()
    {
        // Arrange
        var workouts = new List<GetWorkoutResponseDTO>
        {
            new GetWorkoutResponseDTO
            {
                Id = Guid.NewGuid(),
                Title = "Push Day",
                DurationMin = 60,
                Intensity = "high"
            }
        };
        _mockService.Setup(s => s.GetMyWorkouts())
            .ReturnsAsync(workouts);

        // Act
        var result = await _controller.GetMyWorkouts();

        // Assert
        result.Success.Should().BeTrue();
        var data = result.Data as List<GetWorkoutResponseDTO>;
        data.Should().NotBeNull();
        data.Should().HaveCount(1);
        data!.First().Title.Should().Be("Push Day");
    }

    [Fact]
    public async Task CreateWorkout_WithValidData_ReturnsCreatedWorkout()
    {
        // Arrange
        var createDto = new CreateWorkoutRequestDTO
        {
            Title = "Pull Day",
            Description = "Back and biceps",
            DurationMin = 60,
            Intensity = "medium",
            Exercises = new List<WorkoutExerciseDTO>()
        };
        var createdWorkout = new GetWorkoutResponseDTO
        {
            Id = Guid.NewGuid(),
            Title = "Pull Day",
            DurationMin = 60
        };
        _mockService.Setup(s => s.CreateWorkout(It.IsAny<CreateWorkoutRequestDTO>()))
            .ReturnsAsync(createdWorkout);

        // Act
        var result = await _controller.CreateWorkout(createDto);

        // Assert
        result.Success.Should().BeTrue();
        result.StatusCode.Should().Be(System.Net.HttpStatusCode.Created);
        var data = result.Data as GetWorkoutResponseDTO;
        data.Should().NotBeNull();
        data!.Title.Should().Be("Pull Day");
    }

    [Fact]
    public async Task DeleteWorkout_WithValidId_ReturnsSuccess()
    {
        // Arrange
        var workoutId = Guid.NewGuid();
        _mockService.Setup(s => s.DeleteWorkout(workoutId))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteWorkout(workoutId);

        // Assert
        result.Success.Should().BeTrue();
        var data = (bool)result.Data;
        data.Should().BeTrue();
    }
}
