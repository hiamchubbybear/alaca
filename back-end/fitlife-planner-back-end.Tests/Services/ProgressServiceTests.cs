using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace fitlife_planner_back_end.Tests.Services;

public class ProgressServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly Mock<ILogger<ProgressService>> _mockLogger;
    private readonly Mock<IUserContext> _mockUserContext;
    private readonly ProgressService _service;
    private readonly Guid _testUserId = Guid.NewGuid();

    public ProgressServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new AppDbContext(options);

        _mockLogger = new Mock<ILogger<ProgressService>>();
        _mockUserContext = new Mock<IUserContext>();
        var userInfo = new UserJwtInfo(_testUserId, "testuser", "test@example.com", Api.Enums.Role.User, Guid.NewGuid());
        _mockUserContext.Setup(x => x.User).Returns(userInfo);

        _service = new ProgressService(_context, _mockLogger.Object, _mockUserContext.Object);
    }

    [Fact]
    public async Task GetMyProgress_ReturnsUserProgressOnly()
    {
        // Arrange
        var otherUserId = Guid.NewGuid();
        _context.ProgressEntries.AddRange(
            new ProgressEntry { UserId = _testUserId, Type = "weight", NumericValue = 75 },
            new ProgressEntry { UserId = _testUserId, Type = "bmi", NumericValue = 24 },
            new ProgressEntry { UserId = otherUserId, Type = "weight", NumericValue = 80 }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetMyProgress();

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(p => p.Id != Guid.Empty);
    }

    [Fact]
    public async Task GetMyProgress_WithTypeFilter_ReturnsFilteredResults()
    {
        // Arrange
        _context.ProgressEntries.AddRange(
            new ProgressEntry { UserId = _testUserId, Type = "weight", NumericValue = 75 },
            new ProgressEntry { UserId = _testUserId, Type = "bmi", NumericValue = 24 },
            new ProgressEntry { UserId = _testUserId, Type = "weight", NumericValue = 76 }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetMyProgress("weight");

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(p => p.Type == "weight");
    }

    [Fact]
    public async Task CreateProgressEntry_WithValidData_CreatesEntry()
    {
        // Arrange
        var createDto = new CreateProgressEntryRequestDTO
        {
            Type = "weight",
            NumericValue = 75.5m,
            RecordedAt = DateTime.UtcNow
        };

        // Act
        var result = await _service.CreateProgressEntry(createDto);

        // Assert
        result.Should().NotBeNull();
        result.Type.Should().Be("weight");
        result.NumericValue.Should().Be(75.5m);

        var savedEntry = await _context.ProgressEntries.FindAsync(result.Id);
        savedEntry.Should().NotBeNull();
        savedEntry!.UserId.Should().Be(_testUserId);
    }

    [Fact]
    public async Task DeleteProgressEntry_WithValidId_DeletesEntry()
    {
        // Arrange
        var entry = new ProgressEntry
        {
            UserId = _testUserId,
            Type = "weight",
            NumericValue = 75
        };
        _context.ProgressEntries.Add(entry);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.DeleteProgressEntry(entry.Id);

        // Assert
        result.Should().BeTrue();
        var deletedEntry = await _context.ProgressEntries.FindAsync(entry.Id);
        deletedEntry.Should().BeNull();
    }

    [Fact]
    public async Task DeleteProgressEntry_WithOtherUserEntry_ThrowsException()
    {
        // Arrange
        var otherUserId = Guid.NewGuid();
        var entry = new ProgressEntry
        {
            UserId = otherUserId,
            Type = "weight",
            NumericValue = 75
        };
        _context.ProgressEntries.Add(entry);
        await _context.SaveChangesAsync();

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _service.DeleteProgressEntry(entry.Id));
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
