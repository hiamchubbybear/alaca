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

    public async Task<List<GetExerciseResponseDTO>> GetAllExercises(string? muscleGroup = null)
    {
        var query = _dbContext.ExerciseLibrary.Include(e => e.Tags).AsQueryable();

        if (!string.IsNullOrEmpty(muscleGroup))
        {
            query = query.Where(e => e.PrimaryMuscle == muscleGroup || e.SecondaryMuscles.Contains(muscleGroup));
        }

        var exercises = await query.ToListAsync();
        return exercises.Select(e => MapToResponseDTO(e)).ToList();
    }

    public async Task<GetExerciseResponseDTO> GetExerciseById(Guid id)
    {
        var exercise = await _dbContext.ExerciseLibrary
            .Include(e => e.Tags)
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
            SecondaryMuscles = dto.SecondaryMuscles,
            Equipment = dto.Equipment,
            Difficulty = dto.Difficulty,
            VideoUrl = dto.VideoUrl,
            Images = dto.Images,
            CreatedBy = userId
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
            Tags = exercise.Tags?.Select(t => t.Tag).ToList(),
            CreatedAt = exercise.CreatedAt
        };
    }
}
