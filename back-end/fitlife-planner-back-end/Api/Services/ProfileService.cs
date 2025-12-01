using APIResponseWrapper;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Enums;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Mapper;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Repository;
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
        private readonly ProfileRepository _profileRepository;

        public ProfileService(AppDbContext dbContext, ILogger<ProfileService> logger, Mapping mapping,
            ProfileRepository profileRepository, IUserContext userContext)
        {
            _dbContext = dbContext;
            _logger = logger;
            _mapping = mapping;
            _profileRepository = profileRepository;
            _userContext = userContext;
        }

        public async Task<GetProfileResponseDto> GetMyProfile()
        {
            try
            {
                var userId = _userContext.User.userId;
                var profileId = _userContext.User.profileId;
                var profile =
                    await _dbContext.Profiles.FirstOrDefaultAsync(p =>
                        p.UserId == userId && p.ProfileId == profileId) ??
                    throw new Exception("Profile not found");
                ;
                _logger.LogInformation("Profile id {}", profile.ProfileId );
                _logger.LogInformation("Profile user id  {}", profile.UserId );
                _logger.LogInformation("Profile displayName {}", profile.DisplayName );
                _logger.LogInformation("Profile avatarUri  {}", profile.AvatarUrl );
                var response = _mapping.GetProfileMapper(profile);
                return response ?? throw new Exception("Profile not found");
        }
            catch (Exception e)
            {
                _logger.LogError(e, e.Message);
                throw new Exception("Profile not found");
            }
        }

        // public async Task<Profile> GetMyProfile()
        // {
        //     try
        //     {
        //         var userId = _userContext.User.userId;
        //         var profileId = _userContext.User.profileId;
        //         var profile =
        //             await _dbContext.Profiles.FirstOrDefaultAsync(p =>
        //                 p.UserId == userId && p.ProfileId == profileId) ??
        //             throw new Exception("Profile not found");
        //         ;
        //         _logger.LogInformation("Profile id {}", profile.ProfileId );
        //         _logger.LogInformation("Profile user id  {}", profile.UserId );
        //         _logger.LogInformation("Profile displayName {}", profile.DisplayName );
        //         _logger.LogInformation("Profile avatarUri  {}", profile.AvatarUrl );
        //
        //         return profile ?? throw new Exception("Profile not found");
        // }
        //     catch (Exception e)
        //     {
        //         _logger.LogError(e, e.Message);
        //         throw new Exception("Profile not found");
        //     }
        // }
        public async Task<GetProfileResponseDto> GetProfileByUserId(Guid userId)
        {
            if (string.IsNullOrWhiteSpace(userId.ToString()))
            {
                throw new Exception("Invalid user id ");
            }

            var profile = await _dbContext.Profiles.FirstOrDefaultAsync(p => p.UserId == userId) ??
                          throw new Exception("Profile not found");

            var response = _mapping.GetProfileMapper(profile);
            return response ?? throw new Exception("Profile not found");
        }

        public async Task<CreateProfileResponseDto> CreateProfile(CreateProfileRequestDTO dto, Guid userId)
        {
            var existing = await _dbContext.Profiles.AnyAsync(p => p.UserId == userId);
            if (existing)
            {
                _logger.LogInformation("Profile creation failed: Profile already exists for user {UserId}", userId);
                throw new Exception("Profile already exists for this user");
            }

            var profile = _mapping.InsertProfileMapper(dto, userId);
            var createdProfile = await _dbContext.Profiles.AddAsync(profile);
            await _dbContext.SaveChangesAsync();

            if (createdProfile == null || createdProfile.Entity == null)
            {
                _logger.LogError("Profile creation failed for user {UserId}", userId);
                throw new Exception("Failed to create profile");
            }

            var response = _mapping.InsertProfileResponseMapper(createdProfile.Entity);
            return response;
        }

        public async Task<PaginatedList<Profile>> GetAllProfilesAsync(PaginationParameters paginationParameters)
        {
            return _profileRepository.GetAllProfile(paginationParameters);
        }

        public async Task<UpdateProfileResponseDto> UpdateProfile(UpdateProfileRequestDto dto)
        {
            var currentUserId = _userContext.User.userId;
            var profileId = _userContext.User.profileId;
            var currentUserRole = _userContext.User.role;
            var profile = await _dbContext.Profiles
                .FirstOrDefaultAsync(p => p.ProfileId == profileId);

            if (profile == null)
                throw new Exception("Profile not found");

            bool isOwner = profile.UserId == currentUserId;
            bool isAdmin = currentUserRole == Role.Admin;
            if (!isOwner && !isAdmin)
                throw new UnauthorizedAccessException("You do not have permission to update this profile.");

            profile.DisplayName = dto.DisplayName;
            profile.Gender = dto.Gender;
            profile.BirthDate = dto.BirthDate;
            profile.Bio = dto.Bio;
            profile.AvatarUrl = dto.AvatarUrl;

            await _dbContext.SaveChangesAsync();
            return _mapping.UpdateProfileMapper(profile);
        }
    }
}
