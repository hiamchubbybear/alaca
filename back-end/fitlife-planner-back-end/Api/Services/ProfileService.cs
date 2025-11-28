using APIResponseWrapper;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Mapper;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Application.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;


namespace fitlife_planner_back_end.Api.Services
{
    public class ProfileService
    {
        private readonly AppDbContext _dbContext;
        private readonly ILogger<ProfileService> _logger;
        private readonly IUserContext _userContext;
        private readonly Mapping _mapping;
        public ProfileService(AppDbContext dbContext, ILogger<ProfileService> logger , Mapping mapping)
        {
            _dbContext = dbContext;
            _logger = logger;
            _mapping = mapping;
        }
        public async Task<GetProfileResponseDto> GetMyProfile()
        {
            var userId = _userContext.User.userId;

            var profile = await _dbContext.Profiles.FirstOrDefaultAsync(p => p.UserId == userId) ?? throw new Exception("Profile not found"); ;
            var response = _mapping.GetProfileMapper(profile);
            return response ?? throw new Exception("Profile not found");
        }
        public async Task<GetProfileResponseDto> GetProfileByUserId(Guid userId)
        {
            if (string.IsNullOrWhiteSpace(userId.ToString())){
                throw new Exception("Invalid user id ");
            }
            var profile = await _dbContext.Profiles.FirstOrDefaultAsync(p => p.UserId == userId) ?? throw new Exception("Profile not found");

            var response = _mapping.GetProfileMapper(profile);
            return response ?? throw new Exception("Profile not found");
        }
        public async Task<CreateProfileResponseDto> CreateProfile(CreateProfileRequestDTO dto)
        {
            Guid userId = _userContext.User.userId;
            

            var existing = await _dbContext.Profiles.AnyAsync(p => p.UserId == userId);
            if (existing == null)
            {
                _logger.LogInformation("Profile creation failed: Profile already exists for user {UserId}", userId);
                throw new Exception("Failed to create profile");
            }
           
            var profile = _mapping.InsertProfileMapper(dto, userId);
            var createdProfile = await _dbContext.Profiles.AddAsync(profile) ?? throw new Exception("Failed to create profile"); ;
            await _dbContext.SaveChangesAsync();

            if (createdProfile == null)
            {
                _logger.LogInformation("Profile creation failed: Profile already exists for user {UserId}", userId);
                throw new Exception("Failed to create profile");

            }
            var response = _mapping.InsertProfileResponseMapper(createdProfile.Entity);
            return response;
        }
    }
}
