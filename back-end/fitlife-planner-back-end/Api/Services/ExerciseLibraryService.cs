using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Services;

public class ExerciseLibraryService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<ExerciseLibraryService> _logger;
    private readonly IUserContext _userContext;

    public ExerciseLibraryService(AppDbContext dbContext, ILogger<ExerciseLibraryService> logger, IUserContext userContext)
    {
        _dbContext = dbContext;
        _logger = logger;
        _userContext = userContext;
    }

    public async Task<object> GetAllExercises(string? muscleGroup = null, int page = 1, int pageSize = 20)
    {
        var skip = (page - 1) * pageSize;
        var query = _dbContext.ExerciseLibrary.Include(e => e.ExerciseTags).AsQueryable();

        if (!string.IsNullOrEmpty(muscleGroup))
        {
            query = query.Where(e => e.PrimaryMuscle == muscleGroup || e.SecondaryMuscles.Contains(muscleGroup));
        }

        var total = await query.CountAsync();
        var exercises = await query.Skip(skip).Take(pageSize).ToListAsync();
        return new { exercises = exercises.Select(e => MapToResponseDTO(e)), total, page, pageSize };
    }

    public async Task<GetExerciseResponseDTO> GetExerciseById(Guid id)
    {
        var exercise = await _dbContext.ExerciseLibrary
            .Include(e => e.ExerciseTags)
            .FirstOrDefaultAsync(e => e.Id == id)
            ?? throw new Exception("Exercise not found");

        return MapToResponseDTO(exercise);
    }

    public async Task<GetExerciseResponseDTO> CreateExercise(CreateExerciseRequestDTO dto)
    {
        var userId = _userContext.User.userId;
        var exercise = new ExerciseLibrary
        {
            Title = dto.Title,
            Description = dto.Description,
            PrimaryMuscle = dto.PrimaryMuscle,
            SecondaryMuscles = dto.SecondaryMuscles != null && dto.SecondaryMuscles.Any() ? string.Join(",", dto.SecondaryMuscles) : null,
            Equipment = dto.Equipment,
            Difficulty = dto.Difficulty,
            VideoUrl = dto.VideoUrl,
            Images = dto.Images != null && dto.Images.Any() ? System.Text.Json.JsonSerializer.Serialize(dto.Images) : null,
            CreatedBy = userId,
            Instructions = dto.Instructions,
            CaloriesBurnedPerSet = dto.CaloriesBurnedPerSet,
            RecommendedSets = dto.RecommendedSets.ToString(),
            RecommendedReps = dto.RecommendedReps.ToString(),
            RestSeconds = dto.RestSeconds
        };

        await _dbContext.ExerciseLibrary.AddAsync(exercise);
        await _dbContext.SaveChangesAsync();

        // Add tags
        if (dto.Tags != null && dto.Tags.Any())
        {
            foreach (var tag in dto.Tags)
            {
                await _dbContext.ExerciseTags.AddAsync(new ExerciseTag
                {
                    ExerciseId = exercise.Id,
                    Tag = tag
                });
            }
            await _dbContext.SaveChangesAsync();
        }

        return MapToResponseDTO(exercise);
    }

    public async Task<bool> DeleteExercise(Guid id)
    {
        var exercise = await _dbContext.ExerciseLibrary.FindAsync(id)
            ?? throw new Exception("Exercise not found");

        _dbContext.ExerciseLibrary.Remove(exercise);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    private GetExerciseResponseDTO MapToResponseDTO(ExerciseLibrary exercise)
    {
        return new GetExerciseResponseDTO
        {
            Id = exercise.Id,
            Title = exercise.Title,
            Description = exercise.Description,
            PrimaryMuscle = exercise.PrimaryMuscle,
            SecondaryMuscles = exercise.SecondaryMuscles,
            Equipment = exercise.Equipment,
            Difficulty = exercise.Difficulty,
            VideoUrl = exercise.VideoUrl,
            Images = exercise.Images,
            Tags = exercise.Tags?.Split(',').ToList() ?? exercise.ExerciseTags.Select(t => t.Tag).ToList(),
            CreatedAt = exercise.CreatedAt
        };
    }

    public async Task<GetExerciseResponseDTO> UpdateExercise(Guid id, UpdateExerciseRequestDTO dto)
    {
        var exercise = await _dbContext.ExerciseLibrary.Include(e => e.ExerciseTags).FirstOrDefaultAsync(e => e.Id == id) ?? throw new Exception("Exercise not found");

        if (dto.Title != null) exercise.Title = dto.Title;
        if (dto.Description != null) exercise.Description = dto.Description;
        if (dto.PrimaryMuscle != null) exercise.PrimaryMuscle = dto.PrimaryMuscle;
        if (dto.Difficulty != null) exercise.Difficulty = dto.Difficulty;
        if (dto.Equipment != null) exercise.Equipment = dto.Equipment;
        if (dto.Instructions != null) exercise.Instructions = dto.Instructions;
        if (dto.VideoUrl != null) exercise.VideoUrl = dto.VideoUrl;

        // Handle new fields
        if(dto.SecondaryMuscles != null)
            exercise.SecondaryMuscles = dto.SecondaryMuscles.Any() ? string.Join(",", dto.SecondaryMuscles) : null;

        if (dto.Images != null)
            exercise.Images = dto.Images.Any() ? System.Text.Json.JsonSerializer.Serialize(dto.Images) : null;

        if (dto.CaloriesBurnedPerSet.HasValue) exercise.CaloriesBurnedPerSet = dto.CaloriesBurnedPerSet.Value;
        if (dto.RecommendedSets.HasValue) exercise.RecommendedSets = dto.RecommendedSets.Value.ToString();
        if (dto.RecommendedReps.HasValue) exercise.RecommendedReps = dto.RecommendedReps.Value.ToString();
        if (dto.RestSeconds.HasValue) exercise.RestSeconds = dto.RestSeconds.Value;

        // Handle Tags Update if needed (clean up old tags and add new ones)
        if (dto.Tags != null)
        {
            // Remove existing tags
            var currentTags = _dbContext.ExerciseTags.Where(t => t.ExerciseId == exercise.Id);
            _dbContext.ExerciseTags.RemoveRange(currentTags);

            // Add new tags
            foreach (var tag in dto.Tags)
            {
                await _dbContext.ExerciseTags.AddAsync(new ExerciseTag
                {
                    ExerciseId = exercise.Id,
                    Tag = tag
                });
            }
        }

        exercise.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();
        return MapToResponseDTO(exercise);
    }

    public async Task<object> SearchExercises(string query, int page, int pageSize)
    {
        var skip = (page - 1) * pageSize;
        var searchQuery = _dbContext.ExerciseLibrary
            .Include(e => e.ExerciseTags)
            .Where(e => e.Title.Contains(query) ||
                       e.Description.Contains(query) ||
                       e.PrimaryMuscle.Contains(query) ||
                       e.Equipment.Contains(query));

        var total = await searchQuery.CountAsync();
        var exercises = await searchQuery.Skip(skip).Take(pageSize).ToListAsync();

        return new {
            exercises = exercises.Select(e => MapToResponseDTO(e)),
            total,
            page,
            pageSize
        };
    }
}
