# FitLife Planner - Test Suite Documentation

## Overview

Comprehensive test suite for the FitLife Planner backend API, including:
- **Integration Tests** - Full API endpoint testing with bash script
- **Unit Tests** - Controller and service layer tests with xUnit

---

## Integration Tests

### Script: `script.sh`

Automated bash script that tests all API endpoints with real HTTP requests.

**Features:**
- ✅ 12 test sections covering all features
- ✅ 40+ individual test cases
- ✅ Automatic authentication flow
- ✅ Token management
- ✅ Colored output (✓ green, ✗ red, ℹ yellow)
- ✅ Test counters and summary report
- ✅ Server availability check

**Usage:**
```bash
# Make executable
chmod +x script.sh

# Run all tests
./script.sh
```

**Test Sections:**
1. Authentication & Account Management
2. Profile Management
3. BMI Calculator
4. Food Items Management
5. Nutrition Plans
6. Exercise Library
7. Workout Management
8. Workout Scheduling
9. Progress Tracking
10. Challenges
11. Notifications
12. Posts (Social Features)

**Sample Output:**
```
==========================================
  FitLife Planner - API Integration Tests
==========================================
Base URL: http://localhost:5000
==========================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. AUTHENTICATION & ACCOUNT MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ 1.1 Registering new user...
✓ User registration
ℹ 1.2 Registering admin user...
ℹ 1.3 Logging in as regular user...
✓ User login (Token: eyJhbGciOiJIUzI1NiIsInR5cCI...)

...

==========================================
           TEST SUMMARY
==========================================
Total Tests:  42
Passed:       40
Failed:       2
==========================================
```

---

## Unit Tests

### Test Project: `fitlife-planner-back-end.Tests`

xUnit test project with comprehensive controller and service tests.

**Technologies:**
- xUnit - Test framework
- Moq - Mocking framework
- FluentAssertions - Assertion library
- InMemory Database - For service tests

**Run Tests:**
```bash
cd /Users/chessy/CodeSpace/fitlife-planner/back-end/fitlife-planner-back-end.Tests

# Run all tests
dotnet test

# Run with detailed output
dotnet test --logger "console;verbosity=detailed"

# Run specific test class
dotnet test --filter "FullyQualifiedName~FoodItemControllerTests"

# Generate code coverage
dotnet test /p:CollectCoverage=true
```

---

## Controller Tests

### 1. FoodItemControllerTests
**File:** `Controllers/FoodItemControllerTests.cs`

**Tests:**
- ✅ GetAllFoodItems_ReturnsSuccessResponse
- ✅ GetFoodItemById_WithValidId_ReturnsFood
- ✅ CreateFoodItem_WithValidData_ReturnsCreatedFood

**Example:**
```csharp
[Fact]
public async Task GetAllFoodItems_ReturnsSuccessResponse()
{
    // Arrange
    var foodItems = new List<GetFoodItemResponseDTO> { ... };
    _mockService.Setup(s => s.GetAllFoodItems())
        .ReturnsAsync(foodItems);

    // Act
    var result = await _controller.GetAllFoodItems();

    // Assert
    result.Success.Should().BeTrue();
    result.Data.Should().HaveCount(1);
}
```

---

### 2. WorkoutControllerTests
**File:** `Controllers/WorkoutControllerTests.cs`

**Tests:**
- ✅ GetMyWorkouts_ReturnsWorkoutList
- ✅ CreateWorkout_WithValidData_ReturnsCreatedWorkout
- ✅ DeleteWorkout_WithValidId_ReturnsSuccess

---

### 3. ProgressControllerTests
**File:** `Controllers/ProgressControllerTests.cs`

**Tests:**
- ✅ GetMyProgress_ReturnsProgressList
- ✅ GetMyProgress_WithTypeFilter_ReturnsFilteredList
- ✅ CreateProgressEntry_WithValidData_ReturnsCreatedEntry

---

### 4. ChallengeControllerTests
**File:** `Controllers/ChallengeControllerTests.cs`

**Tests:**
- ✅ GetAllChallenges_ReturnsChallengeList
- ✅ JoinChallenge_WithValidId_ReturnsSuccess
- ✅ UpdateChallengeProgress_WithValidData_ReturnsSuccess

---

## Service Tests

### 1. FoodItemServiceTests
**File:** `Services/FoodItemServiceTests.cs`

**Tests:**
- ✅ GetAllFoodItems_ReturnsAllItems
- ✅ GetFoodItemById_WithValidId_ReturnsItem
- ✅ GetFoodItemById_WithInvalidId_ThrowsException
- ✅ CreateFoodItem_WithValidData_CreatesItem
- ✅ DeleteFoodItem_WithValidId_DeletesItem

**Features:**
- Uses InMemory database
- Tests actual database operations
- Verifies data persistence

**Example:**
```csharp
[Fact]
public async Task CreateFoodItem_WithValidData_CreatesItem()
{
    // Arrange
    var createDto = new CreateFoodItemRequestDTO
    {
        Name = "Oatmeal",
        CaloriesKcal = 150
    };

    // Act
    var result = await _service.CreateFoodItem(createDto);

    // Assert
    result.Should().NotBeNull();
    var savedItem = await _context.FoodItems.FindAsync(result.Id);
    savedItem.Should().NotBeNull();
}
```

---

### 2. ProgressServiceTests
**File:** `Services/ProgressServiceTests.cs`

**Tests:**
- ✅ GetMyProgress_ReturnsUserProgressOnly
- ✅ GetMyProgress_WithTypeFilter_ReturnsFilteredResults
- ✅ CreateProgressEntry_WithValidData_CreatesEntry
- ✅ DeleteProgressEntry_WithValidId_DeletesEntry
- ✅ DeleteProgressEntry_WithOtherUserEntry_ThrowsException

**Features:**
- Tests user isolation (users can only see their own data)
- Tests filtering functionality
- Tests authorization (can't delete other users' data)

---

## Test Coverage

### Current Coverage

**Controllers:**
- ✅ FoodItemController - 3 tests
- ✅ WorkoutController - 3 tests
- ✅ ProgressController - 3 tests
- ✅ ChallengeController - 3 tests
- ✅ AccountController - Existing tests
- ✅ ProfileController - Existing tests
- ✅ AuthenticationController - Existing tests

**Services:**
- ✅ FoodItemService - 5 tests
- ✅ ProgressService - 5 tests

**Integration:**
- ✅ All endpoints - 40+ tests

**Total:** 60+ automated tests

---

## Running All Tests

### Complete Test Suite
```bash
# 1. Run unit tests
cd /Users/chessy/CodeSpace/fitlife-planner/back-end/fitlife-planner-back-end.Tests
dotnet test

# 2. Start the API server (in another terminal)
cd /Users/chessy/CodeSpace/fitlife-planner/back-end/fitlife-planner-back-end
dotnet run

# 3. Run integration tests (in another terminal)
cd /Users/chessy/CodeSpace/fitlife-planner/back-end/fitlife-planner-back-end
./script.sh
```

---

## Test Best Practices

### Controller Tests
- ✅ Use Moq to mock services
- ✅ Test success and error cases
- ✅ Verify response structure
- ✅ Check status codes

### Service Tests
- ✅ Use InMemory database
- ✅ Test business logic
- ✅ Verify data persistence
- ✅ Test authorization
- ✅ Test filtering and querying

### Integration Tests
- ✅ Test complete workflows
- ✅ Test authentication flow
- ✅ Test CRUD operations
- ✅ Verify error handling

---

## Adding New Tests

### Controller Test Template
```csharp
public class NewControllerTests
{
    private readonly Mock<NewService> _mockService;
    private readonly Mock<ILogger<NewController>> _mockLogger;
    private readonly NewController _controller;

    public NewControllerTests()
    {
        _mockService = new Mock<NewService>(null, null, null);
        _mockLogger = new Mock<ILogger<NewController>>();
        _controller = new NewController(_mockService.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task MethodName_Scenario_ExpectedResult()
    {
        // Arrange
        // Act
        // Assert
    }
}
```

### Service Test Template
```csharp
public class NewServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly NewService _service;

    public NewServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new AppDbContext(options);
        _service = new NewService(_context, ...);
    }

    [Fact]
    public async Task MethodName_Scenario_ExpectedResult()
    {
        // Arrange
        // Act
        // Assert
    }

    public void Dispose() => _context.Dispose();
}
```

---

## Continuous Integration

### GitHub Actions (Recommended)
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup .NET
        uses: actions/setup-dotnet@v1
        with:
          dotnet-version: 8.0.x
      - name: Restore dependencies
        run: dotnet restore
      - name: Build
        run: dotnet build --no-restore
      - name: Test
        run: dotnet test --no-build --verbosity normal
```

---

## Summary

✅ **Integration Tests:** 40+ tests covering all endpoints
✅ **Unit Tests:** 20+ tests for controllers and services
✅ **Total Coverage:** 60+ automated tests
✅ **Test Types:** Unit, Integration, Service, Controller
✅ **Tools:** xUnit, Moq, FluentAssertions, InMemory DB

All tests are ready to run and provide comprehensive coverage of the FitLife Planner backend API!
