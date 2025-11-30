using fitlife_planner_back_end.Api.Controllers;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace fitlife_planner_back_end.Tests.Controllers;

public class ChallengeControllerTests
{
    private readonly Mock<ChallengeService> _mockService;
    private readonly Mock<ILogger<ChallengeController>> _mockLogger;
    private readonly ChallengeController _controller;

    public ChallengeControllerTests()
    {
        _mockService = new Mock<ChallengeService>(null, null, null);
        _mockLogger = new Mock<ILogger<ChallengeController>>();
        _controller = new ChallengeController(_mockService.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetAllChallenges_ReturnsChallengeList()
    {
        // Arrange
        var challenges = new List<GetChallengeResponseDTO>
        {
            new GetChallengeResponseDTO
            {
                Id = Guid.NewGuid(),
                Title = "30-Day Plank Challenge",
                ParticipantCount = 150,
                IsParticipating = false
            }
        };
        _mockService.Setup(s => s.GetAllChallenges())
            .ReturnsAsync(challenges);

        // Act
        var result = await _controller.GetAllChallenges();

        // Assert
        result.Success.Should().BeTrue();
        var data = result.Data as List<GetChallengeResponseDTO>;
        data.Should().NotBeNull();
        data.Should().HaveCount(1);
        data!.First().Title.Should().Be("30-Day Plank Challenge");
    }

    [Fact]
    public async Task JoinChallenge_WithValidId_ReturnsSuccess()
    {
        // Arrange
        var challengeId = Guid.NewGuid();
        _mockService.Setup(s => s.JoinChallenge(challengeId))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.JoinChallenge(challengeId);

        // Assert
        result.Success.Should().BeTrue();
        var data = (bool)result.Data;
        data.Should().BeTrue();
        result.Message.Should().Be("Successfully joined challenge");
    }

    [Fact]
    public async Task UpdateChallengeProgress_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var challengeId = Guid.NewGuid();
        var updateDto = new UpdateChallengeProgressRequestDTO
        {
            Progress = "{\"day\": 5, \"completed\": true}"
        };
        _mockService.Setup(s => s.UpdateChallengeProgress(challengeId, It.IsAny<UpdateChallengeProgressRequestDTO>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.UpdateChallengeProgress(challengeId, updateDto);

        // Assert
        result.Success.Should().BeTrue();
        var data = (bool)result.Data;
        data.Should().BeTrue();
    }
}
