using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.Enums;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using FluentAssertions;
using Xunit;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.Interface;

namespace fitlife_planner_back_end.Tests.Controllers;

public class ProfileControllerTests : IntegrationTestBase
{
    public ProfileControllerTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task ProfileFlow_ShouldWorkCorrectly()
    {
        // Arrange
        var email = "profileuser@example.com";
        var password = "Password123!";
        Guid userId = Guid.Empty;

        // Seed user
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var user = new User("profileuser", email, password);
            db.Users.Add(user);
            await db.SaveChangesAsync();
            userId = user.Id;
        }

        // Login
        var loginResponse =
            await _client.PostAsJsonAsync("/auth/login", new LoginRequestDto { Email = email, Password = password });
        var loginContent = await loginResponse.Content.ReadFromJsonAsync<TestApiResponse<AuthenticationResponseDto>>();
        loginContent.Should().NotBeNull();
        loginContent!.Data.Should().NotBeNull();
        var token = loginContent.Data!.Token;
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        // 1. Create Profile
        var createProfileRequest = new CreateProfileRequestDTO
        {
            DisplayName = "Test User",
            AvatarUrl = "http://avatar.com",
            BirthDate = DateTime.Now.AddYears(-20),
            Gender = Gender.MALE,
            Bio = "Bio"
        };
        var createResponse = await _client.PostAsJsonAsync("/profile", createProfileRequest);
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var createContent = await createResponse.Content.ReadFromJsonAsync<TestApiResponse<CreateProfileResponseDto>>();
        createContent.Should().NotBeNull();
        createContent!.Data.Should().NotBeNull();
        var profileId = createContent.Data!.Id;

        // 2. Get Profile
        var getResponse = await _client.GetAsync("/profile");
        getResponse.StatusCode.Should().Be(HttpStatusCode.Found);
        var getContent = await getResponse.Content.ReadFromJsonAsync<TestApiResponse<GetProfileResponseDto>>();
        getContent.Should().NotBeNull();
        getContent!.Data.Should().NotBeNull();
        getContent.Data!.DisplayName.Should().Be("Test User");

        // 3. Update Profile
        var updateRequest = new UpdateProfileRequestDto("Updated Name", "http://avatar.com", DateTime.Now.AddYears(-20),
            Gender.FEMALE, "New Bio");
        var updateResponse = await _client.PutAsJsonAsync($"/profile/{profileId}", updateRequest);
        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify update
        var getResponse2 = await _client.GetAsync("/profile");
        var getContent2 = await getResponse2.Content.ReadFromJsonAsync<TestApiResponse<GetProfileResponseDto>>();
        getContent2.Should().NotBeNull();
        getContent2!.Data.Should().NotBeNull();
        getContent2.Data!.DisplayName.Should().Be("Updated Name");
    }
}
