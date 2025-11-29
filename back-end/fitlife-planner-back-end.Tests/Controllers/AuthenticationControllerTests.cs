using System.Net;
using System.Net.Http.Json;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Configurations;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using FluentAssertions;
using Xunit;

namespace fitlife_planner_back_end.Tests.Controllers;

public class AuthenticationControllerTests : IntegrationTestBase
{
    public AuthenticationControllerTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Login_ShouldReturnOk_WhenCredentialsAreValid()
    {
        // Arrange
        var email = "test@example.com";
        var password = "Password123!";

        // Seed user
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            if (!db.Users.Any(u => u.Email == email))
            {
                db.Users.Add(new User("testuser", email, password));
                await db.SaveChangesAsync();
            }
        }

        var loginRequest = new LoginRequestDto { Email = email, Password = password };

        // Act
        var response = await _client.PostAsJsonAsync("/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
