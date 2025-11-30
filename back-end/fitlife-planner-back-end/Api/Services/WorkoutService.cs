using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Services;

public class WorkoutService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<WorkoutService> _logger;
    private readonly IUserContext _userContext;

    public WorkoutService(AppDbContext dbContext, ILogger<WorkoutService> logger, IUserContext userContext)
    {
        _dbContext = dbContext;
        _logger = logger;
        _userContext = userContext;
    }

    public virtual async Task<List<GetWorkoutResponseDTO>> GetMyWorkouts()
    {
        var userId = _userContext.User.userId;
        var workouts = await _dbContext.Workouts
            .Include(w => w.Exercises)
            .ThenInclude(we => we.Exercise)
            .Where(w => w.OwnerUserId == userId)
            .ToListAsync();

        return workouts.Select(w => MapToResponseDTO(w)).ToList();
    }

    public virtual async Task<GetWorkoutResponseDTO> GetWorkoutById(Guid id)
    {
        var workout = await _dbContext.Workouts
            .Include(w => w.Exercises)
            .ThenInclude(we => we.Exercise)
            .FirstOrDefaultAsync(w => w.Id == id)
            ?? throw new Exception("Workout not found");

        return MapToResponseDTO(workout);
    }

    public virtual async Task<GetWorkoutResponseDTO> CreateWorkout(CreateWorkoutRequestDTO dto)
    {
        var userId = _userContext.User.userId;
        var workout = new Workout
        {
            OwnerUserId = userId,
            Title = dto.Title,
            Description = dto.Description,
            DurationMin = dto.DurationMin,
            Intensity = dto.Intensity
        };

        await _dbContext.Workouts.AddAsync(workout);
        await _dbContext.SaveChangesAsync();

        // Add exercises
        if (dto.Exercises != null && dto.Exercises.Any())
        {
            foreach (var exerciseDto in dto.Exercises)
            {
                var workoutExercise = new WorkoutExercise
                {
                    WorkoutId = workout.Id,
                    ExerciseId = exerciseDto.ExerciseId,
                    OrderIndex = exerciseDto.OrderIndex,
                    Sets = exerciseDto.Sets,
                    Reps = exerciseDto.Reps,
                    RestSeconds = exerciseDto.RestSeconds,
                    Tempo = exerciseDto.Tempo,
                    Notes = exerciseDto.Notes
                };
                await _dbContext.WorkoutExercises.AddAsync(workoutExercise);
            }
            await _dbContext.SaveChangesAsync();
        }

        // Reload with exercises
        var createdWorkout = await _dbContext.Workouts
            .Include(w => w.Exercises)
            .ThenInclude(we => we.Exercise)
            .FirstAsync(w => w.Id == workout.Id);

        return MapToResponseDTO(createdWorkout);
    }

    public virtual async Task<bool> DeleteWorkout(Guid id)
    {
        var userId = _userContext.User.userId;
        var workout = await _dbContext.Workouts.FindAsync(id)
            ?? throw new Exception("Workout not found");

        if (workout.OwnerUserId != userId)
            throw new UnauthorizedAccessException("You don't own this workout");

        _dbContext.Workouts.Remove(workout);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    private GetWorkoutResponseDTO MapToResponseDTO(Workout workout)
    {
        return new GetWorkoutResponseDTO
        {
            Id = workout.Id,
            OwnerUserId = workout.OwnerUserId,
            Title = workout.Title,
            Description = workout.Description,
            DurationMin = workout.DurationMin,
            Intensity = workout.Intensity,
            CreatedAt = workout.CreatedAt,
            Exercises = workout.Exercises?.Select(we => new WorkoutExerciseDetailDTO
            {
                Id = we.Id,
                ExerciseId = we.ExerciseId,
                ExerciseTitle = we.Exercise?.Title ?? "",
                OrderIndex = we.OrderIndex,
                Sets = we.Sets,
                Reps = we.Reps,
                RestSeconds = we.RestSeconds,
                Tempo = we.Tempo,
                Notes = we.Notes
            }).ToList()
        };
    }
}
