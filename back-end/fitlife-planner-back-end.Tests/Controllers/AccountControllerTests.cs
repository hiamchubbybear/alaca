using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Configurations;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using FluentAssertions;
using Xunit;
using APIResponseWrapper;

namespace fitlife_planner_back_end.Tests.Controllers;

public class AccountControllerTests : IntegrationTestBase
{
    public AccountControllerTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateUser_ShouldReturnFound_WhenDataIsValid()
    {
        // Arrange
        var request = new CreateAccountRequestDto("newuser", "newuser@example.com", "Password123!");

        // Act
        var response = await _client.PostAsJsonAsync("/account", request);

        // Assert
        // The controller returns HttpStatusCode.Found (302) on success
        response.StatusCode.Should().Be(HttpStatusCode.Found);
    }

    [Fact]
    public async Task GetUser_ShouldReturnFound_WhenAuthenticated()
    {
        // Arrange
        var email = "authuser@example.com";
        var password = "Password123!";

        // Seed user
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            if (!db.Users.Any(u => u.Email == email))
            {
                db.Users.Add(new User("authuser", email, password));
                await db.SaveChangesAsync();
            }
        }

        // Login to get token
        var loginResponse = await _client.PostAsJsonAsync("/auth/login", new LoginRequestDto { Email = email, Password = password });
        var loginContent = await loginResponse.Content.ReadFromJsonAsync<TestApiResponse<AuthenticationResponseDto>>();
        loginContent.Should().NotBeNull();
        loginContent!.Data.Should().NotBeNull();
        var token = loginContent.Data!.Token;

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/account");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Found);
    }
}
